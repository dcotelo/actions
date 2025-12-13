import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import JobModal from './JobModal';

const FlowDiagram = ({ jobs }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [hoveredJob, setHoveredJob] = useState(null);
  const [highlightedPaths, setHighlightedPaths] = useState(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState(null);
  const [focusedJob, setFocusedJob] = useState(null);
  const jobRefs = useRef({});

  const gridSize = 100;
  const boxWidth = 180;
  const boxHeight = 80;

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

  const calculateLevels = useCallback((jobs) => {
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
  }, []);

  const organizeParallelJobs = useCallback((jobs, levels, diagramHeight) => {
    const parallelGroups = {};
    
    Object.entries(jobs).forEach(([jobId, job]) => {
      const level = levels[jobId];
      if (!parallelGroups[level]) {
        parallelGroups[level] = { jobs: [], parallel: false };
      }
      parallelGroups[level].jobs.push(jobId);
      parallelGroups[level].parallel = parallelGroups[level].jobs.length > 1;
    });

    const newPositions = {};
    let currentX = gridSize;

    Object.entries(parallelGroups).forEach(([level, group]) => {
      const jobCount = group.jobs.length;
      const totalHeight = jobCount * boxHeight + (jobCount - 1) * gridSize;
      let startY = ((diagramHeight || 600) - totalHeight) / 2;

      group.jobs.forEach((jobId, index) => {
        newPositions[jobId] = {
          x: currentX,
          y: startY + (index * (boxHeight + gridSize))
        };
      });

      currentX += boxWidth + (gridSize * 2);
    });

    return { positions: newPositions, parallelGroups };
  }, [gridSize, boxWidth, boxHeight]);

  const calculatePath = useCallback((source, target) => {
    if (!source || !target) return '';
    
    const sourceX = source.x + boxWidth;
    const sourceY = source.y + boxHeight/2;
    const targetX = target.x;
    const targetY = target.y + boxHeight/2;
    
    const midX = (sourceX + targetX) / 2;
    
    return `M ${sourceX} ${sourceY}
            L ${midX} ${sourceY}
            L ${midX} ${targetY}
            L ${targetX} ${targetY}`;
  }, [boxWidth, boxHeight]);

  const getJobDependencies = useCallback((jobId) => {
    const job = jobs[jobId];
    if (!job || !job.needs) return [];
    return Array.isArray(job.needs) ? job.needs : [job.needs];
  }, [jobs]);

  const getJobDependents = useCallback((jobId) => {
    return Object.entries(jobs)
      .filter(([id, job]) => {
        if (!job.needs) return false;
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        return needs.includes(jobId);
      })
      .map(([id]) => id);
  }, [jobs]);

  const highlightPaths = useCallback((jobId) => {
    const paths = new Set();
    const deps = getJobDependencies(jobId);
    const dependents = getJobDependents(jobId);
    
    deps.forEach(depId => {
      paths.add(`path-${depId}-${jobId}`);
    });
    dependents.forEach(depId => {
      paths.add(`path-${jobId}-${depId}`);
    });
    
    setHighlightedPaths(paths);
  }, [getJobDependencies, getJobDependents]);

  const createConnection = useCallback((sourceId, targetId, currentPositions) => {
    const sourcePos = currentPositions[sourceId];
    const targetPos = currentPositions[targetId];
    
    if (!sourcePos || !targetPos) return null;

    const pathId = `path-${sourceId}-${targetId}`;
    const isHighlighted = highlightedPaths.has(pathId);

    return createSvgElement("path", {
      id: pathId,
      class: `dependency-arrow ${isHighlighted ? 'highlighted' : ''}`,
      d: calculatePath(sourcePos, targetPos)
    });
  }, [createSvgElement, calculatePath, highlightedPaths]);

  const drawJobs = useCallback((jobId, pos, isParallel) => {
    const jobGroup = createSvgElement("g", {
      class: `job-node ${isParallel ? 'parallel' : ''} ${hoveredJob === jobId ? 'hovered' : ''} ${focusedJob === jobId ? 'focused' : ''}`,
      transform: `translate(${pos.x},${pos.y})`,
      "data-job-id": jobId,
      tabIndex: 0,
      role: "button",
      "aria-label": `Job ${jobId}. Click to view details.`,
    });

    const rect = createSvgElement("rect", {
      width: String(boxWidth),
      height: String(boxHeight),
      class: `job-box ${isParallel ? 'parallel' : ''}`
    });

    const text = createSvgElement("text", {
      x: String(boxWidth/2),
      y: String(boxHeight/2),
      class: "job-text"
    });
    text.textContent = jobId;

    jobGroup.appendChild(rect);
    jobGroup.appendChild(text);

    jobGroup.addEventListener("click", () => setSelectedJob(jobId));
    jobGroup.addEventListener("mouseenter", () => {
      setHoveredJob(jobId);
      highlightPaths(jobId);
      const job = jobs[jobId];
      const runsOn = Array.isArray(job['runs-on']) ? job['runs-on'].join(', ') : job['runs-on'];
      setTooltip({ jobId, runsOn, x: pos.x + boxWidth/2, y: pos.y - 20 });
    });
    jobGroup.addEventListener("mouseleave", () => {
      setHoveredJob(null);
      setHighlightedPaths(new Set());
      setTooltip(null);
    });
    jobGroup.addEventListener("focus", () => {
      setFocusedJob(jobId);
      highlightPaths(jobId);
    });
    jobGroup.addEventListener("blur", () => {
      setFocusedJob(null);
      setHighlightedPaths(new Set());
    });
    jobGroup.addEventListener("keydown", (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelectedJob(jobId);
      }
    });

    jobRefs.current[jobId] = jobGroup;
    return jobGroup;
  }, [createSvgElement, boxWidth, boxHeight, hoveredJob, focusedJob, jobs, highlightPaths]);

  const drawDiagram = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !jobs) return;
    
    svg.innerHTML = '';
    const levels = calculateLevels(jobs);
    const { diagramWidth, diagramHeight } = calculateDimensions(levels);
    const { positions: newPositions, parallelGroups } = organizeParallelJobs(jobs, levels, diagramHeight);
    setPositions(newPositions);

    const mainGroup = createSvgElement("g", { 
      class: "diagram-content",
      transform: `translate(${pan.x}, ${pan.y}) scale(${zoom})`
    });

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

    Object.entries(jobs).forEach(([jobId, job]) => {
      if (job.needs) {
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        needs.forEach(needId => {
          const connection = createConnection(needId, jobId, newPositions);
          if (connection) mainGroup.appendChild(connection);
        });
      }
    });

    Object.entries(parallelGroups).forEach(([level, group]) => {
      group.jobs.forEach(jobId => {
        const jobGroup = drawJobs(jobId, newPositions[jobId], group.parallel);
        mainGroup.appendChild(jobGroup);
      });
    });

    svg.setAttribute("width", String(Math.max(1200, diagramWidth + 100)));
    svg.setAttribute("height", String(Math.max(600, diagramHeight + 100)));

    svg.appendChild(mainGroup);
  }, [jobs, createSvgElement, calculateLevels, organizeParallelJobs, drawJobs, createConnection, calculateDimensions, pan, zoom, highlightedPaths]);

  useEffect(() => {
    if (!jobs) return;
    drawDiagram();
  }, [jobs, drawDiagram]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!focusedJob) {
        const jobIds = Object.keys(jobs);
        if (jobIds.length > 0 && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
          setFocusedJob(jobIds[0]);
          jobRefs.current[jobIds[0]]?.focus();
        }
        return;
      }

      const jobIds = Object.keys(jobs);
      const currentIndex = jobIds.indexOf(focusedJob);
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % jobIds.length;
        setFocusedJob(jobIds[nextIndex]);
        jobRefs.current[jobIds[nextIndex]]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prevIndex = currentIndex === 0 ? jobIds.length - 1 : currentIndex - 1;
        setFocusedJob(jobIds[prevIndex]);
        jobRefs.current[jobIds[prevIndex]]?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedJob, jobs]);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div 
      className="flow-diagram" 
      ref={containerRef}
      role="region"
      aria-label="Workflow diagram"
    >
      <div className="diagram-header">
        <h3>Workflow Diagram</h3>
        <div className="zoom-controls" role="group" aria-label="Zoom controls">
          <button 
            onClick={handleZoomOut}
            className="zoom-btn"
            aria-label="Zoom out"
            disabled={zoom <= 0.5}
          >
            −
          </button>
          <span className="zoom-level" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={handleZoomIn}
            className="zoom-btn"
            aria-label="Zoom in"
            disabled={zoom >= 2}
          >
            +
          </button>
          <button 
            onClick={handleZoomReset}
            className="zoom-reset-btn"
            aria-label="Reset zoom and pan"
          >
            Reset
          </button>
        </div>
      </div>
      <div
        className="diagram-container"
        style={{
          width: '100%',
          height: '600px',
          overflow: 'auto',
          border: '1px solid #eee',
          position: 'relative'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg 
          ref={svgRef} 
          className="flow-svg"
          style={{ cursor: isPanning ? 'grabbing' : 'default' }}
        ></svg>
        {tooltip && (
          <div 
            className="job-tooltip"
            style={{
              position: 'absolute',
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translateX(-50%)'
            }}
            role="tooltip"
          >
            <strong>{tooltip.jobId}</strong>
            <br />
            Runs on: {tooltip.runsOn}
          </div>
        )}
      </div>
      {selectedJob && jobs[selectedJob] && (
        <JobModal 
          job={jobs[selectedJob]} 
          jobId={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

FlowDiagram.propTypes = {
  jobs: PropTypes.objectOf(PropTypes.shape({
    'runs-on': PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    needs: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    steps: PropTypes.arrayOf(PropTypes.object)
  })).isRequired
};

export default React.memo(FlowDiagram);
