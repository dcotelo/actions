import React, { useEffect, useRef } from 'react';

const FlowDiagram = ({ jobs }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!jobs || !svgRef.current) return;

    const jobIds = Object.keys(jobs);
    const levels = calculateLevels(jobs);
    drawDiagram(levels);
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

  const drawDiagram = (levels) => {
    const svg = svgRef.current;
    svg.innerHTML = '';
    
    // Calculate grid dimensions
    const gridSize = 100;
    const boxWidth = 180;
    const boxHeight = 80;
    
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

    // Calculate diagram size
    const maxLevel = Math.max(...Object.values(levels));
    const maxJobsInLevel = Math.max(...Object.values(Object.entries(levels)
      .reduce((acc, [jobId, level]) => {
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {})));

    const diagramWidth = (maxLevel + 1) * (boxWidth + gridSize);
    const diagramHeight = (maxJobsInLevel) * (boxHeight + gridSize);

    svg.setAttribute("width", diagramWidth + gridSize * 2);
    svg.setAttribute("height", diagramHeight + gridSize * 2);

    const levelGroups = Object.entries(levels).reduce((acc, [jobId, level]) => {
      acc[level] = acc[level] || [];
      acc[level].push(jobId);
      return acc;
    }, {});

    // Draw jobs in grid
    Object.entries(levelGroups).forEach(([level, jobIds]) => {
      jobIds.forEach((jobId, index) => {
        const job = jobs[jobId];
        const x = level * (boxWidth + gridSize) + gridSize;
        const y = index * (boxHeight + gridSize) + gridSize;

        // Create job group with hover effect
        const jobGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        jobGroup.setAttribute("class", "job-node");
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", boxWidth);
        rect.setAttribute("height", boxHeight);
        rect.setAttribute("class", "job-box");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x + boxWidth/2);
        text.setAttribute("y", y + boxHeight/2);
        text.setAttribute("class", "job-text");
        text.textContent = jobId;

        jobGroup.appendChild(rect);
        jobGroup.appendChild(text);
        svg.appendChild(jobGroup);

        // Draw dependency arrows
        if (job.needs) {
          const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
          needs.forEach(needId => {
            const sourceLevel = levels[needId];
            const sourceIndex = levelGroups[sourceLevel].indexOf(needId);
            const sourceX = sourceLevel * (boxWidth + gridSize) + gridSize + boxWidth;
            const sourceY = sourceIndex * (boxHeight + gridSize) + gridSize + boxHeight/2;
            
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const endX = x;
            const endY = y + boxHeight/2;
            
            path.setAttribute("d", `M ${sourceX} ${sourceY} C ${x-gridSize} ${sourceY}, ${x-gridSize} ${endY}, ${endX} ${endY}`);
            path.setAttribute("class", "dependency-arrow");
            svg.appendChild(path);
          });
        }
      });
    });
  };

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