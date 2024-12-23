import React, { useEffect, useRef, useState, useCallback } from 'react';
import JobModal from './JobModal';

const FlowDiagram = ({ jobs }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredJob, setHoveredJob] = useState(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedJob, setSelectedJob] = useState(null);

  // Add these constants at the top level of the component
  const gridSize = 100;
  const boxWidth = 180;
  const boxHeight = 80;

  // Move utility functions before they're used
  const createSvgElement = useCallback((type, attributes = {}) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", type);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }, []);

  const calculateDimensions = useCallback((levels) => {
    const maxLevel = Math.max(...Object.values(levels));
    const maxJobsInLevel = Math.max(
      ...Object.values(
        Object.entries(levels).reduce((acc, [jobId, level]) => {
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {})
      )
    );

    return {
      diagramWidth: (maxLevel + 1) * (boxWidth + gridSize * 2),
      diagramHeight: maxJobsInLevel * (boxHeight + gridSize)
    };
  }, [boxWidth, boxHeight, gridSize]);

  const createZoomButton = useCallback((label, yOffset, onClick) => {
    const button = createSvgElement("g", {
      class: "zoom-button",
      transform: `translate(0, ${yOffset})`
    });
    
    const rect = createSvgElement("rect", {
      width: "30",
      height: "30",
      rx: "4"
    });
    
    const text = createSvgElement("text", {
      x: "15",
      y: "20",
      "text-anchor": "middle"
    });
    text.textContent = label;
    
    button.appendChild(rect);
    button.appendChild(text);
    button.addEventListener("click", onClick);
    
    return button;
  }, [createSvgElement]);

  const handleZoom = useCallback((direction) => {
    setScale(prevScale => {
      const factor = direction === 'in' ? 1.2 : 0.8;
      return Math.min(Math.max(0.5, prevScale * factor), 2);
    });
  }, []);

  // Initialize positions when jobs change
  useEffect(() => {
    if (!jobs) return;
    
    const initializePositions = () => {
      const levels = calculateLevels(jobs);
      const newPositions = organizeParallelJobs(jobs, levels);
      setPositions(newPositions);
    };

    if (Object.keys(positions).length === 0) {
      initializePositions();
    }
  }, [jobs]);

  const calculateLevels = (jobs) => {
    const levels = {};
    const visited = new Set();

    const getJobLevel = (jobId) => {
      if (visited.has(jobId)) return levels[jobId];
      visited.add(jobId);

      const job = jobs[jobId];
      if (!job.needs || job.needs.length === 0) {
        levels[jobId] = 0;
        return 0;
      }

      const dependencyLevels = (Array.isArray(job.needs) ? job.needs : [job.needs])
        .map(getJobLevel);
      levels[jobId] = Math.max(...dependencyLevels) + 1;
      return levels[jobId];
    };

    Object.keys(jobs).forEach(jobId => getJobLevel(jobId));
    return levels;
  };

  const handleMouseDown = (e, jobId) => {
    // Don't initiate drag if it's just a click
    if (e.detail === 1) {
      handleJobClick(jobId);
      return;
    }

    e.stopPropagation();
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    setDragging(jobId);
    setOffset({
      x: svgP.x - (positions[jobId]?.x || 0),
      y: svgP.y - (positions[jobId]?.y || 0)
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    setPositions(prev => ({
      ...prev,
      [dragging]: {
        x: Math.round((svgP.x - offset.x) / gridSize) * gridSize,
        y: Math.round((svgP.y - offset.y) / gridSize) * gridSize
      }
    }));
    updateConnections();
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleMouseEnter = (jobId) => {
    if (!dragging) {  // Only highlight if not dragging
      setHoveredJob(jobId);
      highlightConnections(jobId);
    }
  };

  const handleMouseLeave = () => {
    setHoveredJob(null);
    resetHighlights();
  };

  const highlightConnections = (jobId) => {
    // Highlight all connected paths
    const job = jobs[jobId];
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      needs.forEach(needId => {
        const path = document.querySelector(`#path-${needId}-${jobId}`);
        if (path) {
          path.classList.add('highlighted');
        }
      });
    }

    // Highlight dependent jobs
    Object.entries(jobs).forEach(([id, job]) => {
      const needs = Array.isArray(job.needs) ? job.needs : [];
      if (needs.includes(jobId)) {
        const path = document.querySelector(`#path-${jobId}-${id}`);
        if (path) {
          path.classList.add('highlighted');
        }
      }
    });
  };

  const resetHighlights = () => {
    const paths = document.querySelectorAll('.dependency-arrow');
    paths.forEach(path => path.classList.remove('highlighted'));
  };

  const updateConnections = () => {
    Object.entries(jobs).forEach(([jobId, job]) => {
      if (job.needs) {
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        needs.forEach(needId => {
          const sourcePos = positions[needId];
          const targetPos = positions[jobId];
          const path = document.querySelector(`#path-${needId}-${jobId}`);
          if (path && sourcePos && targetPos) {
            const d = calculatePath(sourcePos, targetPos);
            path.setAttribute('d', d);
          }
        });
      }
    });
  };

  const calculatePath = (source, target) => {
    if (!source || !target) return '';
    
    const sourceX = source.x + boxWidth;
    const sourceY = source.y + boxHeight/2;
    const targetX = target.x;
    const targetY = target.y + boxHeight/2;
    
    // Use straight lines with right angles
    const midX = (sourceX + targetX) / 2;
    
    return `M ${sourceX} ${sourceY}
            L ${midX} ${sourceY}
            L ${midX} ${targetY}
            L ${targetX} ${targetY}`;
  };

  const organizeParallelJobs = (jobs, levels) => {
    const parallelGroups = {};
    
    // Group jobs by their dependency level
    Object.entries(jobs).forEach(([jobId, job]) => {
      const level = levels[jobId];
      if (!parallelGroups[level]) {
        parallelGroups[level] = { jobs: [], parallel: false };
      }
      parallelGroups[level].jobs.push(jobId);
      // Mark jobs as parallel if there's more than one in the same level
      parallelGroups[level].parallel = parallelGroups[level].jobs.length > 1;
    });

    const newPositions = {};
    let currentX = gridSize;

    // Position jobs level by level
    Object.entries(parallelGroups).forEach(([level, group]) => {
      const jobCount = group.jobs.length;
      const totalHeight = jobCount * boxHeight + (jobCount - 1) * gridSize;
      let startY = (600 - totalHeight) / 2;

      group.jobs.forEach((jobId, index) => {
        newPositions[jobId] = {
          x: currentX,
          y: startY + (index * (boxHeight + gridSize))
        };
      });

      currentX += boxWidth + (gridSize * 2);
    });

    return { positions: newPositions, parallelGroups };
  };

  const handleJobClick = useCallback((jobId, e) => {
    if (dragging) return; // Don't show modal if dragging
    setSelectedJob(jobId);
  }, [dragging]);

  const drawJobs = (jobId, pos, isParallel) => {
    const jobGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    jobGroup.setAttribute("class", `job-node ${isParallel ? 'parallel' : ''}`);
    jobGroup.setAttribute("transform", `translate(${pos.x},${pos.y})`);
    jobGroup.setAttribute("data-job-id", jobId);

    // Prevent text selection during drag
    jobGroup.addEventListener('selectstart', (e) => e.preventDefault());
    jobGroup.addEventListener('dragstart', (e) => e.preventDefault());

    // Create box with improved styling
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", boxWidth);
    rect.setAttribute("height", boxHeight);
    rect.setAttribute("class", `job-box ${isParallel ? 'parallel' : ''}`);

    // Add job title
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", boxWidth/2);
    text.setAttribute("y", boxHeight/2);
    text.setAttribute("class", "job-text");
    text.textContent = jobId;

    jobGroup.appendChild(rect);
    jobGroup.appendChild(text);

    // Add event listeners
    jobGroup.addEventListener("mousedown", (e) => handleMouseDown(e, jobId));
    // Remove separate click handler as it's now handled in mousedown
    jobGroup.addEventListener("mouseenter", () => handleMouseEnter(jobId));
    jobGroup.addEventListener("mouseleave", handleMouseLeave);

    return jobGroup;
  };

  const createConnection = (sourceId, targetId, positions) => {
    const sourcePos = positions[sourceId];
    const targetPos = positions[targetId];
    
    if (!sourcePos || !targetPos) return null;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", `path-${sourceId}-${targetId}`);
    path.setAttribute("class", "dependency-arrow");
    path.setAttribute("d", calculatePath(sourcePos, targetPos));
    
    return path;
  };

  const drawDiagram = useCallback((levels) => {
    const svg = svgRef.current;
    if (!svg || !jobs) return;
    
    svg.innerHTML = '';

    // Create main groups
    const mainGroup = createSvgElement("g", {
      class: "diagram-content",
      transform: `scale(${scale})`
    });

    const zoomGroup = createSvgElement("g", {
      class: "zoom-controls",
      transform: "translate(20, 20)"
    });

    // Setup arrowhead marker
    const defs = createSvgElement("defs");
    const marker = createSvgElement("marker", {
      id: "arrowhead",
      markerWidth: "10",
      markerHeight: "7",
      refX: "10",
      refY: "3.5",
      orient: "auto"
    });

    marker.appendChild(createSvgElement("polygon", {
      points: "0 0, 10 3.5, 0 7",
      fill: "#0366d6"
    }));

    defs.appendChild(marker);
    svg.appendChild(defs);

    // Calculate and set dimensions
    const { diagramWidth, diagramHeight } = calculateDimensions(levels);
    svg.setAttribute("width", Math.max(1200, diagramWidth * scale + 100));
    svg.setAttribute("height", Math.max(600, diagramHeight * scale + 100));

    // Draw content
    const { positions: newPositions, parallelGroups } = organizeParallelJobs(jobs, levels);
    setPositions(newPositions);

    // Draw connections first
    drawConnections(jobs, newPositions, mainGroup);
    
    // Draw job boxes
    drawJobBoxes(parallelGroups, newPositions, mainGroup);

    // Add groups to SVG
    svg.appendChild(mainGroup);
    svg.appendChild(createZoomControls(zoomGroup));
  }, [jobs, scale, createSvgElement, calculateDimensions, createZoomButton, handleZoom]);

  const handleWheel = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.deltaY !== 0) {
      e.preventDefault();
      handleZoom(e.deltaY < 0 ? 'in' : 'out');
    }
  }, [handleZoom]);

  const drawConnections = useCallback((jobs, positions, mainGroup) => {
    Object.entries(jobs).forEach(([jobId, job]) => {
      if (job.needs) {
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        needs.forEach(needId => {
          const connectionPath = createConnection(needId, jobId, positions);
          if (connectionPath) {
            mainGroup.appendChild(connectionPath);
          }
        });
      }
    });
  }, [createConnection]);

  const drawJobBoxes = useCallback((parallelGroups, positions, mainGroup) => {
    Object.entries(parallelGroups).forEach(([level, group]) => {
      group.jobs.forEach(jobId => {
        const jobGroup = drawJobs(jobId, positions[jobId], group.parallel);
        mainGroup.appendChild(jobGroup);
      });
    });
  }, [drawJobs]);

  const createZoomControls = useCallback((zoomGroup) => {
    zoomGroup.appendChild(createZoomButton("+", 0, () => handleZoom('in')));
    zoomGroup.appendChild(createZoomButton("-", 40, () => handleZoom('out')));
    zoomGroup.appendChild(createZoomButton("↺", 80, () => setScale(1)));
    return zoomGroup;
  }, [createZoomButton, handleZoom]);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg || !jobs) return;

    // Add event listeners
    container.addEventListener('wheel', handleWheel, { passive: false });
    svg.addEventListener("mousemove", handleMouseMove);
    svg.addEventListener("mouseup", handleMouseUp);
    svg.addEventListener("mouseleave", handleMouseUp);

    // Initialize diagram
    if (Object.keys(positions).length > 0) {
      const levels = calculateLevels(jobs);
      drawDiagram(levels);
    }

    // Cleanup
    return () => {
      container.removeEventListener('wheel', handleWheel);
      svg.removeEventListener("mousemove", handleMouseMove);
      svg.removeEventListener("mouseup", handleMouseUp);
      svg.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [jobs, positions, dragging, scale, handleWheel, drawDiagram]);

  return (
    <div className="flow-diagram" ref={containerRef}>
      <h3>Workflow Flow</h3>
      <div className="diagram-container">
        <svg ref={svgRef} className="flow-svg"></svg>
      </div>
      {selectedJob && (
        <JobModal 
          job={jobs[selectedJob]} 
          jobId={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

export default React.memo(FlowDiagram);