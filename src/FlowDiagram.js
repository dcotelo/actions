import React, { useEffect, useRef, useState, useCallback } from 'react';
import JobModal from './JobModal';

const FlowDiagram = ({ jobs }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);

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

  const organizeParallelJobs = useCallback((jobs, levels) => {
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

  const createConnection = useCallback((sourceId, targetId, currentPositions) => {
    const sourcePos = currentPositions[sourceId];
    const targetPos = currentPositions[targetId];
    
    if (!sourcePos || !targetPos) return null;

    return createSvgElement("path", {
      id: `path-${sourceId}-${targetId}`,
      class: "dependency-arrow",
      d: calculatePath(sourcePos, targetPos)
    });
  }, [createSvgElement, calculatePath]);

  const drawJobs = useCallback((jobId, pos, isParallel) => {
    const jobGroup = createSvgElement("g", {
      class: `job-node ${isParallel ? 'parallel' : ''}`,
      transform: `translate(${pos.x},${pos.y})`,
      "data-job-id": jobId,
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

    return jobGroup;
  }, [createSvgElement, boxWidth, boxHeight]);

  const drawDiagram = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !jobs) return;
    
    svg.innerHTML = '';
    const levels = calculateLevels(jobs);
    const { positions: newPositions, parallelGroups } = organizeParallelJobs(jobs, levels);
    setPositions(newPositions);

    const mainGroup = createSvgElement("g", { class: "diagram-content" });

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

    const { diagramWidth, diagramHeight } = calculateDimensions(levels);
    svg.setAttribute("width", String(Math.max(1200, diagramWidth + 100)));
    svg.setAttribute("height", String(Math.max(600, diagramHeight + 100)));

    svg.appendChild(mainGroup);
  }, [jobs, createSvgElement, calculateLevels, organizeParallelJobs, createConnection, drawJobs, calculateDimensions]);

  useEffect(() => {
    if (!jobs) return;
    drawDiagram();
  }, [jobs, drawDiagram]);

  return (
    <div className="flow-diagram" ref={containerRef}>
      <h3>Workflow Diagram</h3>
      <div className="diagram-container">
        <svg ref={svgRef} className="flow-svg"></svg>
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

export default React.memo(FlowDiagram);