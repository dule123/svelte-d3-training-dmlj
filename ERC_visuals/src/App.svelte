<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { currentYear, budgetByGrantType, dataByYear } from './stores';

  let radarChartData = [];



  function drawRadarChart(data) {
    const container = d3.select('#radarChart');
    container.select("svg").remove();  // Clear previous SVG to prevent duplication

    const svg = container.append('svg')
      .attr('width', 600)
      .attr('height', 600);

    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const radius = Math.min(width, height) / 2 - 40;
    const angleSlice = Math.PI * 2 / data.length;

    const rScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, radius]);

    const axes = svg.selectAll(".axis")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "axis");

    // Draw radial lines
    axes.append("line")
      .attr("x1", width / 2)
      .attr("y1", height / 2)
      .attr("x2", d => width / 2 + rScale(d.value) * Math.cos(angleSlice * data.indexOf(d) - Math.PI/2))
      .attr("y2", d => height / 2 + rScale(d.value) * Math.sin(angleSlice * data.indexOf(d) - Math.PI/2))
      .attr("stroke", "grey");

    // Draw labels
    axes.append("text")
      .attr("class", "legend")
      .style("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", d => width / 2 + (radius + 20) * Math.cos(angleSlice * data.indexOf(d) - Math.PI/2))
      .attr("y", d => height / 2 + (radius + 20) * Math.sin(angleSlice * data.indexOf(d) - Math.PI/2))
      .text(d => d.key);
  }

    // Reactive block to handle updates
    $: {
    console.log({ radarChartData });

  };

  onMount(() => {
    if (radarChartData.length > 0) {
      drawRadarChart(radarChartData);
    }
  });

  // Ensure the radar chart data is updated reactively
  $: radarChartData = $budgetByGrantType;
</script>

<h3>Select Year:</h3>
<select bind:value={$currentYear}>
  {#each $dataByYear as yearGroup}
    <option value={yearGroup.key}>{yearGroup.key}</option>
  {/each}
</select>

<div id="radarChart"></div>
