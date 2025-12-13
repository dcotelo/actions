/**
 * FlowGraph - Main graph visualization component using Dagre
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { buildGraphData, calculateLayout, detectCycles } from '../utils/graphLayout';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import GraphControls from './GraphControls';

const FlowGraph = ({ jobs, onNodeClick, layoutDirection: initialDirection = 'LR' }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [layoutDirection, setLayoutDirection] = useState(initialDirection);
  const [hasInitialized, setHasInitialized] = useState(false);
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Build graph data and calculate layout
  const { graphData, layout, cycles, cycleNodeIds, cycleEdgeIds } = useMemo(() => {
    if (!jobs || typeof jobs !== 'object' || Object.keys(jobs).length === 0) {
      return {
        graphData: { nodes: [], edges: [], rootNodes: [], terminalNodes: [] },
        layout: { nodes: [], edges: [], width: 800, height: 600 },
        cycles: [],
        cycleNodeIds: new Set(),
        cycleEdgeIds: new Set(),
      };
    }

    try {
      const data = buildGraphData(jobs);
      const layoutResult = calculateLayout(data, layoutDirection);
      const detectedCycles = detectCycles(jobs);
      const cycleNodes = new Set();
      const cycleEdges = new Set();

      detectedCycles.forEach(cycle => {
        cycle.forEach(nodeId => cycleNodes.add(nodeId));
        for (let i = 0; i < cycle.length - 1; i++) {
          cycleEdges.add(`${cycle[i]}-${cycle[i + 1]}`);
        }
      });

      return {
        graphData: data,
        layout: layoutResult,
        cycles: detectedCycles,
        cycleNodeIds: cycleNodes,
        cycleEdgeIds: cycleEdges,
      };
    } catch (error) {
      console.error('Error building graph layout:', error);
      return {
        graphData: { nodes: [], edges: [], rootNodes: [], terminalNodes: [] },
        layout: { nodes: [], edges: [], width: 800, height: 600 },
        cycles: [],
        cycleNodeIds: new Set(),
        cycleEdgeIds: new Set(),
      };
    }
  }, [jobs, layoutDirection]);

  // Auto-center graph on initial load
  useEffect(() => {
    if (containerRef.current && layout.width > 0 && layout.height > 0 && !hasInitialized) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const centerX = Math.max(0, (containerWidth - layout.width) / 2);
      const centerY = Math.max(0, (containerHeight - layout.height) / 2);
      setPan({ x: centerX, y: centerY });
      setHasInitialized(true);
    }
  }, [layout.width, layout.height, hasInitialized]);
  
  // Reset initialization when jobs change
  useEffect(() => {
    setHasInitialized(false);
  }, [jobs]);

  // Pan handlers - only pan on middle mouse button or space key + drag
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    // Only pan on middle mouse button (button 1) or space + left click
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  }, [pan, isSpacePressed]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      e.preventDefault();
      e.stopPropagation();
      // Clear hover when panning
      if (hoveredNodeId) {
        setHoveredNodeId(null);
      }
    }
  }, [isPanning, panStart, hoveredNodeId]);

  const handleMouseUp = useCallback((e) => {
    if (isPanning) {
      e.preventDefault();
    }
    setIsPanning(false);
  }, [isPanning]);

  // Zoom handlers - disabled mouse wheel zoom, only use controls
  const handleWheel = useCallback((e) => {
    // Disabled - zoom only via controls
    // Allow normal page scrolling
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(2, prev + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.5, prev - 0.1));
  }, []);

  const handleReset = useCallback(() => {
    if (!containerRef.current || !layout.width || !layout.height) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Center the graph
    const centerX = (containerWidth - layout.width) / 2;
    const centerY = (containerHeight - layout.height) / 2;
    
    setZoom(1);
    setPan({ x: Math.max(0, centerX), y: Math.max(0, centerY) });
  }, [layout]);

  const handleFitToView = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    if (!layout.width || !layout.height || layout.width === 0 || layout.height === 0) {
      // Reset to default
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    
    const padding = 40;
    const scaleX = (containerWidth - padding * 2) / layout.width;
    const scaleY = (containerHeight - padding * 2) / layout.height;
    const scale = Math.min(scaleX, scaleY, 0.95);
    
    const scaledWidth = layout.width * scale;
    const scaledHeight = layout.height * scale;
    
    setZoom(scale);
    setPan({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2,
    });
  }, [layout]);

  // Calculate highlighted nodes and edges based on hover
  const { highlightedNodeIds, highlightedEdgeIds } = useMemo(() => {
    if (!hoveredNodeId || !layout.edges || !layout.edges.length) {
      return { highlightedNodeIds: new Set(), highlightedEdgeIds: new Set() };
    }

    const highlightedNodes = new Set([hoveredNodeId]);
    const highlightedEdges = new Set();

    // Find all upstream nodes (dependencies)
    const findUpstream = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      if (layout.edges && Array.isArray(layout.edges)) {
        layout.edges.forEach(edge => {
          if (edge && edge.target === nodeId && edge.source) {
            highlightedNodes.add(edge.source);
            if (edge.id) highlightedEdges.add(edge.id);
            findUpstream(edge.source, visited);
          }
        });
      }
    };

    // Find all downstream nodes (dependents)
    const findDownstream = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      if (layout.edges && Array.isArray(layout.edges)) {
        layout.edges.forEach(edge => {
          if (edge && edge.source === nodeId && edge.target) {
            highlightedNodes.add(edge.target);
            if (edge.id) highlightedEdges.add(edge.id);
            findDownstream(edge.target, visited);
          }
        });
      }
    };

    findUpstream(hoveredNodeId);
    findDownstream(hoveredNodeId);

    // Add edges connected to highlighted nodes
    if (layout.edges && Array.isArray(layout.edges)) {
      layout.edges.forEach(edge => {
        if (edge && edge.source && edge.target && 
            highlightedNodes.has(edge.source) && highlightedNodes.has(edge.target) &&
            edge.id) {
          highlightedEdges.add(edge.id);
        }
      });
    }

    return { highlightedNodeIds: highlightedNodes, highlightedEdgeIds: highlightedEdges };
  }, [hoveredNodeId, layout.nodes.length, layout.edges.length]);

  // Node interaction handlers
  const handleNodeHover = useCallback((nodeId, e) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isPanning) {
      setHoveredNodeId(nodeId);
    }
  }, [isPanning]);

  const handleNodeLeave = useCallback((e) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isPanning) {
      setHoveredNodeId(null);
    }
  }, [isPanning]);

  const handleNodeClick = useCallback((nodeId) => {
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  }, [onNodeClick]);

  // Load layout direction from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('graph-layout-direction');
    if (saved === 'LR' || saved === 'TB') {
      setLayoutDirection(saved);
    }
  }, []);

  // Save layout direction to localStorage
  useEffect(() => {
    localStorage.setItem('graph-layout-direction', layoutDirection);
  }, [layoutDirection]);

  if (!jobs || Object.keys(jobs).length === 0) {
    return (
      <div className="flow-graph-empty">
        <p>No jobs to display</p>
      </div>
    );
  }

  // Safety check for layout
  if (!layout || !Array.isArray(layout.nodes) || !Array.isArray(layout.edges)) {
    return (
      <div className="flow-graph-empty">
        <p>Loading graph...</p>
      </div>
    );
  }

  // Calculate SVG dimensions - use actual layout dimensions
  const svgWidth = Math.max(800, layout.width || 800);
  const svgHeight = Math.max(600, layout.height || 600);

  return (
    <div className="flow-graph" role="region" aria-label="Workflow flow graph">
      <div className="flow-graph-header">
        <h3>Workflow Flow</h3>
      </div>

      {cycles.length > 0 && (
        <div className="flow-graph-cycle-warning" role="alert">
          <strong>Warning:</strong> {cycles.length} cycle(s) detected in dependency graph
        </div>
      )}

      <GraphControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onFitToView={handleFitToView}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={setLayoutDirection}
      />

      <div
        ref={containerRef}
        className="flow-graph-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{ cursor: isPanning || isSpacePressed ? 'grabbing' : 'default' }}
      >
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="flow-graph-svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#0366d6" />
            </marker>
            <marker
              id="arrowhead-highlighted"
              markerWidth="12"
              markerHeight="8"
              refX="12"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 12 4, 0 8" fill="#28a745" />
            </marker>
          </defs>

          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          >
            {/* Render edges first (behind nodes) */}
            {layout.edges && Array.isArray(layout.edges) && layout.edges.map(edge => (
              edge && edge.id ? (
                <GraphEdge
                  key={edge.id}
                  edge={edge}
                  isHighlighted={highlightedEdgeIds.has(edge.id)}
                  isInCycle={cycleEdgeIds.has(edge.id)}
                />
              ) : null
            ))}

            {/* Render nodes */}
            {layout.nodes && Array.isArray(layout.nodes) && layout.nodes.map(node => (
              node && node.id ? (
                <GraphNode
                  key={node.id}
                  node={node}
                  isHighlighted={highlightedNodeIds.has(node.id)}
                  isInCycle={cycleNodeIds.has(node.id)}
                  onClick={handleNodeClick}
                  onHover={handleNodeHover}
                  onLeave={handleNodeLeave}
                />
              ) : null
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

FlowGraph.propTypes = {
  jobs: PropTypes.object.isRequired,
  onNodeClick: PropTypes.func,
  layoutDirection: PropTypes.oneOf(['LR', 'TB']),
};

export default FlowGraph;

