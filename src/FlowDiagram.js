import React, { useEffect, useRef, useState } from 'react';

const FlowDiagram = ({ jobs }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredJob, setHoveredJob] = useState(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Add these constants at the top level of the component
  const gridSize = 100;
  const boxWidth = 180;
  const boxHeight = 80;

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
    e.stopPropagation();  // Prevent event bubbling
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    setDragging(jobId);
    setOffset({
      x: svgP.x - positions[jobId].x,
      y: svgP.y - positions[jobId].y
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
    jobGroup.addEventListener("mouseenter", () => handleMouseEnter(jobId));
    jobGroup.addEventListener("mouseleave", handleMouseLeave);
    jobGroup.addEventListener("mousedown", (e) => handleMouseDown(e, jobId));

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

  const drawDiagram = (levels) => {
    const svg = svgRef.current;
    if (!svg || !jobs) return;
    
    svg.innerHTML = '';
    
    // Calculate diagram dimensions before creating elements
    const maxLevel = Math.max(...Object.values(levels));
    const maxJobsInLevel = Math.max(
      ...Object.values(
        Object.entries(levels).reduce((acc, [jobId, level]) => {
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {})
      )
    );

    const diagramWidth = (maxLevel + 1) * (boxWidth + gridSize * 2);
    const diagramHeight = maxJobsInLevel * (boxHeight + gridSize);

    // Add zoom controls container
    const zoomGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    zoomGroup.setAttribute("class", "zoom-controls");
    zoomGroup.setAttribute("transform", `translate(20, 20)`);

    const zoomIn = createZoomButton("+", 0, () => handleZoom('in'));
    const zoomOut = createZoomButton("-", 40, () => handleZoom('out'));
    const resetZoom = createZoomButton("↺", 80, () => setScale(1));

    zoomGroup.appendChild(zoomIn);
    zoomGroup.appendChild(zoomOut);
    zoomGroup.appendChild(resetZoom);

    // Create main content group with zoom transform
    const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    mainGroup.setAttribute("class", "diagram-content");
    mainGroup.setAttribute("transform", `scale(${scale})`);

    // Create grid pattern
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", "grid");
    pattern.setAttribute("width", gridSize);
    pattern.setAttribute("height", gridSize);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    
    const gridPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    gridPath.setAttribute("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`);
    gridPath.setAttribute("fill", "none");
    gridPath.setAttribute("stroke", "#e0e0e0");
    gridPath.setAttribute("stroke-width", "1");
    
    pattern.appendChild(gridPath);
    defs.appendChild(pattern);
    svg.appendChild(defs);

    // Add grid background
    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", "url(#grid)");
    svg.appendChild(background);

    // Organize and draw jobs
    const { positions: newPositions, parallelGroups } = organizeParallelJobs(jobs, levels);
    setPositions(newPositions);

    // Draw connections first (behind jobs)
    Object.entries(jobs).forEach(([jobId, job]) => {
      if (job.needs) {
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        needs.forEach(needId => {
          const connectionPath = createConnection(needId, jobId, newPositions);
          if (connectionPath) {
            mainGroup.appendChild(connectionPath);
          }
        });
      }
    });

    // Draw job boxes
    Object.entries(parallelGroups).forEach(([level, group]) => {
      group.jobs.forEach(jobId => {
        const jobGroup = drawJobs(jobId, newPositions[jobId], group.parallel);
        mainGroup.appendChild(jobGroup);
      });
    });

    svg.appendChild(mainGroup);
    svg.appendChild(zoomGroup);
    
    // Move all diagram content inside mainGroup instead of svg
    mainGroup.appendChild(defs);
    mainGroup.appendChild(background);
    
    // Update diagram dimensions for scrolling
    const totalWidth = Math.max(1200, diagramWidth * scale + 100);
    const totalHeight = Math.max(600, diagramHeight * scale + 100);
    svg.setAttribute("width", totalWidth);
    svg.setAttribute("height", totalHeight);
  };

  const createZoomButton = (label, yOffset, onClick) => {
    const button = document.createElementNS("http://www.w3.org/2000/svg", "g");
    button.setAttribute("class", "zoom-button");
    button.setAttribute("transform", `translate(0, ${yOffset})`);
    
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "30");
    rect.setAttribute("height", "30");
    rect.setAttribute("rx", "4");
    
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "15");
    text.setAttribute("y", "20");
    text.textContent = label;
    
    button.appendChild(rect);
    button.appendChild(text);
    button.addEventListener("click", onClick);
    
    return button;
  };

  const handleZoom = (direction) => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(0.5, newScale), 2); // Limit zoom between 0.5x and 2x
    });
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoom(e.deltaY < 0 ? 'in' : 'out');
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  useEffect(() => {
    if (!jobs || !svgRef.current || Object.keys(positions).length === 0) return;
    
    const svg = svgRef.current;
    svg.addEventListener("mousemove", handleMouseMove);
    svg.addEventListener("mouseup", handleMouseUp);
    svg.addEventListener("mouseleave", handleMouseUp);

    const levels = calculateLevels(jobs);
    drawDiagram(levels);

    return () => {
      svg.removeEventListener("mousemove", handleMouseMove);
      svg.removeEventListener("mouseup", handleMouseUp);
      svg.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [jobs, positions, dragging]);

  return (
    <div className="flow-diagram" ref={containerRef}>
      <h3>Workflow Flow</h3>
      <div className="diagram-container">
        <svg ref={svgRef} className="flow-svg"></svg>
      </div>
    </div>
  );
};

export default FlowDiagram;