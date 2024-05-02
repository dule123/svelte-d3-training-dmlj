<script>
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { feature } from 'topojson-client';
  import { heatmapData, currentYear } from '../stores';
  import { setYear } from '../stores'; // Import setYear function from stores.js

  let svg;
  let width = 975;
  let height = 610;
  let svgElement;
  let projection;
  let path; // Define path here so it can be accessed globally
  let zoom;
  let g;

  // Create color scale for heatmap
  const colorScale = d3.scaleSequential(d3.interpolateOrRd);

  onMount(async () => {
    svgElement = d3.select(svg)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    projection = d3.geoMercator()
      .scale(250)
      .translate([width / 2, height / 2]);

    path = d3.geoPath().projection(projection); // Move path definition here

    zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

    try {
      const response = await fetch("https://raw.githubusercontent.com/dule123/svelte-d3-training-dmlj/main/ERC_visuals/public/data/europe.topojson");
      if (!response.ok) throw new Error('Failed to fetch Europe TopoJSON: ' + response.status);
      const europe = await response.json();

      const countries = feature(europe, europe.objects.europe).features;

      g = svgElement.append("g");

      g.selectAll("path")
        .data(countries)
        .join("path")
          .attr("fill", "#ccc")
          .attr("d", path)
          .attr("cursor", "pointer")
          .on("click", clicked)
        .append("title")
          .text(d => d.properties.NAME);

      svgElement.call(zoom);
    } catch (error) {
      console.error("Error loading or processing map data:", error);
    }

    // Subscribe to heatmap data changes
    heatmapData.subscribe(updateHeatmap);
    currentYear.subscribe(updateYear);
  });

  onDestroy(() => {
    // Clean up event listeners
    svgElement.on(".zoom", null);
  });

  function updateHeatmap(data) {
    // Update color scale domain based on the heatmap data
    const maxCount = d3.max(data, d => d.count);
    colorScale.domain([0, maxCount]);
    
    // Update map colors based on heatmap data
    g.selectAll("path")
      .attr("fill", d => {
        const countryData = data.find(entry => entry.country === d.properties.NAME);
        return countryData ? colorScale(countryData.count) : "#ccc";
      });
  }

  function updateYear(newYear) {
    // Call setYear function from stores.js to update the current year
    setYear(newYear);
  }

  function clicked(event, d) {
    const bounds = path.bounds(d);
    event.stopPropagation();
    zoomTo(bounds);
  }

  function zoomed(event) {
    const g = d3.select(svg).select("g");
    g.attr("transform", event.transform);
  }

  function zoomTo([[x0, y0], [x1, y1]]) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const x = (x0 + x1) / 2;
    const y = (y0 + y1) / 2;
    const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    svgElement.transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }
</script>

<svg bind:this={svg}></svg>

<div class="legend">
  <div class="gradient"></div>
  <div class="labels">
    <span>Less Grants</span>
    <span>More Grants</span>
  </div>
</div>

<input type="range" min="2021" max="2025" bind:value={$currentYear} />

<style>
  svg {
    width: 70%;
    height: auto;
    border: 1px solid black;
  }

  .legend {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    width: 70%;
  }

  .gradient {
    background: linear-gradient(to right, #fff, #f00);
    height: 20px;
    width: 100%;
  }

  .labels {
    display: flex;
  }
</style>
