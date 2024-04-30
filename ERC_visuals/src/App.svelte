<script>
	import { data, dataByYear, dataByGrantType } from './stores';

	$: console.log({data: $data, dataByYear: $dataByYear, dataByGrantType : $dataByGrantType });

	import { onMount } from 'svelte';
	import { select, selectAll } from 'd3-selection';
	import { scaleLinear, scalePoint } from 'd3-scale';
	import { line, area, curveLinearClosed } from 'd3-shape';
	import { max } from 'd3-array';
	// import { dataByYear } from './stores';

  let yearData = [];

  onMount(async () => {
  const rawData = await dataByYear;
  // Ensure that rawData is an array of objects with a key and values property
  if (Array.isArray(rawData) && rawData.length > 0 && typeof rawData[0] === 'object' && 'key' in rawData[0] && 'values' in rawData[0]) {
    yearData = rawData.find(d => d.key === 2015).values;
    drawRadarChart();
  } else {
    console.error('Invalid data format for radar chart');
  }
});

  function drawRadarChart() {
    // Define the dimensions and margins for the chart
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    // Select the SVG element and set its dimensions
    const svg = select('main')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left + width / 2},${margin.top + height / 2})`);

    // Define the scale for the radar chart
    const maxValue = max(yearData, d => d.value);
    const angleSlice = Math.PI * 2 / yearData.length;
    const rScale = scaleLinear()
      .domain([0, maxValue])
      .range([0, radius]);

    // Create a group for each grant type
    const groups = svg.selectAll('.radar-group')
      .data(yearData)
      .enter()
      .append('g')
      .attr('class', 'radar-group');

    // Create a line generator for drawing the radar chart lines
    const lineGenerator = line()
      .x((d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .y((d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .curve(curveLinearClosed);

    // Draw the radar chart lines
    groups.append('path')
      .attr('class', 'radar-line')
      .attr('d', d => lineGenerator(d.values))
      .attr('fill', 'none')
      .attr('stroke', (d, i) => `hsl(${i * (360 / yearData.length)}, 70%, 50%)`)
      .attr('stroke-width', 2);

    // Draw the radar chart points
    groups.selectAll('.radar-point')
      .data(d => d.values)
      .enter()
      .append('circle')
      .attr('class', 'radar-point')
      .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('r', 4)
      .attr('fill', (d, i) => `hsl(${i * (360 / yearData.length)}, 70%, 50%)`);

    // Draw the radar chart axes
    const axisGrid = svg.append('g')
      .attr('class', 'axis-grid');
    
    axisGrid.selectAll('.radar-axis')
      .data(yearData)
      .enter()
      .append('line')
      .attr('class', 'radar-axis')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1);

    // Add labels to the radar chart axes
    axisGrid.selectAll('.radar-label')
      .data(yearData)
      .enter()
      .append('text')
      .attr('class', 'radar-label')
      .attr('x', (d, i) => rScale(maxValue * 1.15) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => rScale(maxValue * 1.15) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d.key)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.5em');

    // Add a title to the radar chart
    svg.append('text')
      .attr('class', 'radar-title')
      .attr('x', 0)
      .attr('y', -margin.top / 2)
      .text('Radar Chart - Funding by Grant Type (2015)')
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold');
  }

</script>

<main></main>

<style>
</style>
