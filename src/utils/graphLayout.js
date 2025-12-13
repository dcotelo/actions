/**
 * Graph layout utilities using Dagre
 */
import dagre from 'dagre';

/**
 * Build graph data structure from jobs
 */
export const buildGraphData = (jobs) => {
  if (!jobs || typeof jobs !== 'object') {
    return { nodes: [], edges: [], rootNodes: [], terminalNodes: [] };
  }

  const nodes = [];
  const edges = [];
  const rootNodes = [];
  const terminalNodes = [];
  const dependentsMap = {};

  // Build nodes and collect dependents
  Object.entries(jobs).forEach(([jobId, job]) => {
    const needs = job.needs 
      ? (Array.isArray(job.needs) ? job.needs : [job.needs])
      : [];

    nodes.push({
      id: jobId,
      label: jobId,
      job: job,
      needs: needs,
      isRoot: needs.length === 0,
      isTerminal: false, // Will be determined after building dependents map
    });

    if (needs.length === 0) {
      rootNodes.push(jobId);
    }

    // Track dependents
    needs.forEach(depId => {
      if (!dependentsMap[depId]) {
        dependentsMap[depId] = [];
      }
      dependentsMap[depId].push(jobId);
    });
  });

  // Identify terminal nodes (no dependents)
  nodes.forEach(node => {
    if (!dependentsMap[node.id] || dependentsMap[node.id].length === 0) {
      node.isTerminal = true;
      terminalNodes.push(node.id);
    }
  });

  // Build edges
  Object.entries(jobs).forEach(([jobId, job]) => {
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      needs.forEach(depId => {
        // Only add edge if dependency exists
        if (jobs[depId]) {
          edges.push({
            id: `${depId}-${jobId}`,
            source: depId,
            target: jobId,
          });
        }
      });
    }
  });

  return {
    nodes,
    edges,
    rootNodes,
    terminalNodes,
  };
};

/**
 * Calculate graph layout using Dagre
 */
export const calculateLayout = (graphData, direction = 'LR') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction, // 'LR' for left-to-right, 'TB' for top-to-bottom
    nodesep: 50,
    ranksep: 80,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes
  graphData.nodes.forEach(node => {
    g.setNode(node.id, {
      label: node.label,
      width: 200,
      height: 100,
    });
  });

  // Add edges
  graphData.edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(g);

  // Extract positions
  const positionedNodes = graphData.nodes.map(node => {
    const dagreNode = g.node(node.id);
    return {
      ...node,
      x: dagreNode.x,
      y: dagreNode.y,
      width: dagreNode.width,
      height: dagreNode.height,
    };
  });

  const positionedEdges = graphData.edges.map(edge => {
    const dagreEdge = g.edge(edge.source, edge.target);
    return {
      ...edge,
      points: dagreEdge.points || [],
    };
  });

  const graphInfo = g.graph();
  
  return {
    nodes: positionedNodes,
    edges: positionedEdges,
    width: graphInfo.width || 800,
    height: graphInfo.height || 600,
  };
};

/**
 * Detect cycles in the graph
 */
export const detectCycles = (jobs) => {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();
  const path = [];

  const hasCycle = (jobId) => {
    if (recursionStack.has(jobId)) {
      // Found a cycle
      const cycleStart = path.indexOf(jobId);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), jobId]);
      }
      return true;
    }

    if (visited.has(jobId)) {
      return false;
    }

    visited.add(jobId);
    recursionStack.add(jobId);
    path.push(jobId);

    const job = jobs[jobId];
    if (job && job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      for (const needId of needs) {
        if (jobs[needId] && hasCycle(needId)) {
          return true;
        }
      }
    }

    recursionStack.delete(jobId);
    path.pop();
    return false;
  };

  Object.keys(jobs).forEach(jobId => {
    if (!visited.has(jobId)) {
      hasCycle(jobId);
    }
  });

  // Check for self-references
  Object.entries(jobs).forEach(([jobId, job]) => {
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      if (needs.includes(jobId)) {
        cycles.push([jobId, jobId]);
      }
    }
  });

  return cycles;
};

/**
 * Get cycle edges for highlighting
 */
export const getCycleEdges = (cycles, edges) => {
  const cycleEdgeIds = new Set();
  
  cycles.forEach(cycle => {
    for (let i = 0; i < cycle.length - 1; i++) {
      const source = cycle[i];
      const target = cycle[i + 1];
      const edgeId = `${source}-${target}`;
      cycleEdgeIds.add(edgeId);
    }
  });

  return edges.filter(edge => cycleEdgeIds.has(edge.id));
};

