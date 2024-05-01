<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { currentYear, budgetByGrantType, dataByYear } from './stores';

 
  let radarChartData = [];

  function drawRadialBarChart(data) {
  const container = d3.select('#radarChart');
  container.selectAll("svg").remove();  // Clear previous SVG to prevent duplication

  // Define the desired margins
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = 600, height = 600;
  const innerRadius = 120, outerRadius = Math.min(width, height) / 2 - 10;
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left + width / 2},${margin.top + height / 2})`)
    .style("font", "10px sans-serif");

  const x = d3.scaleBand()
    .domain(data.map(d => d.key))
    .range([0, 2 * Math.PI])
    .align(0);

  const y = d3.scaleRadial()
    .domain([0, d3.max(data, d => d.value)])
    .range([innerRadius, outerRadius]);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => y(d.value))
    .startAngle(d => x(d.key))
    .endAngle(d => x(d.key) + x.bandwidth())
    .padAngle(0.01)
    .padRadius(innerRadius);

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.key)) // ensure the domain is correctly set
    .range(d3.schemeSpectral[data.length])
    .unknown("#ccc"); // default color for unknown keys

	svg.append("text")
      .attr("x", 0)
      .attr("y", (-height / 2 - 30) )
      .text("Total Funding by Grant Type")
      .style("font-size", "16px")
      .style("text-anchor", "middle");

  // Draw the arcs
  svg.append("g")
    .selectAll("path")
    .data(data)
    .join("path")
      .attr("fill", d => color(d.key))
      .attr("d", arc)
    .append("title")
      .text(d => `${d.key}: ${d.value.toLocaleString()}`);
	  

//   svg.append("text")
// 		.attr("x", 0)
// 		.attr("y", height / 2 - 10)
// 		.text("Grant Types")
// 		.style("font-size", "12px")
// 		.style("text-anchor", "middle");

//   svg.append("text")
//     .attr("x", -width / 2 + 20)
//     .attr("y", -height / 2 + 20)
//     .text("Funding Amount")
//     .style("font-size", "12px")
//     .style("text-anchor", "middle")
//     .attr("transform", "rotate(-90)");

  // Draw radial scales
  const yAxis = svg.append("g")
    .attr("text-anchor", "middle");

  yAxis.selectAll("circle")
    .data(y.ticks(5).slice(1))
    .join("circle")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("r", y)
      .attr("stroke-opacity", 0.5);

  yAxis.selectAll("text")
    .data(y.ticks(5))
    .join("text")
      .attr("y", d => -y(d))
      .attr("dy", "0.35em")
      .text(d => d.toLocaleString())
      .style("fill", "#333"); // ensuring text is visible

  // Legends and other features as necessary
  // Add a legend for color coding
  const legend = svg.append("g")
    .attr("transform", `translate(${width / 2 - 350}, ${-height / 2 + 250})`);

  legend.selectAll(null)
    .data(color.domain())
    .enter()
    .append("rect")
    .attr("y", (d, i) => i * 20)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", color);

  legend.selectAll(null)
    .data(color.domain())
    .enter()
    .append("text")
    .attr("x", 24)
    .attr("y", (d, i) => i * 20 + 9)
    .attr("dy", "0.35em")
    .text(d => d)
    .style("font", "12px sans-serif");

	
}



// Ensure the color scale and other data-dependent elements are set up correctly within the Svelte reactive context:
$: if (radarChartData.length > 0) {
  drawRadialBarChart(radarChartData);
};

onMount(() => {
  if (radarChartData.length > 0) {
    drawRadialBarChart(radarChartData);
  }
});

$: radarChartData = $budgetByGrantType;
</script>



<h3>Select Year:</h3>
<select bind:value={$currentYear}>
  {#each $dataByYear as yearGroup}
    <option value={yearGroup.key}>{yearGroup.key}</option>
  {/each}
</select>

<div id="radarChart"></div>
