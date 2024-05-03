<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { feature } from 'topojson-client';
  import { heatmapData } from '../stores';

  let svg;
  let colorScale; // Define a color scale for dynamic coloring
  let g; // Will be used for appending paths
  let zoom; // Define zoom behavior globally

  onMount(async () => {
    const width = 975;
    const height = 610;
    const svgElement = d3.select(svg)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    const projection = d3.geoMercator()
      .scale(150)
      .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", event => g.attr("transform", event.transform));

    try {
      const response = await fetch("https://raw.githubusercontent.com/dule123/svelte-d3-training-dmlj/main/ERC_visuals/public/data/europe.topojson");
      if (!response.ok) throw new Error('Failed to fetch Europe TopoJSON: ' + response.status);
      const europe = await response.json();

      const countries = feature(europe, europe.objects.europe).features;

      // Setup color scale
      colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max($heatmapData, d => d.totalBudget)]);

      g = svgElement.append("g");
      g.selectAll("path")
        .data(countries)
        .join("path")
          .attr("d", path)
          .attr("fill", d => {
            const data = $heatmapData.find(h => h.country === d.properties.NAME);
            return data ? colorScale(data.totalBudget) : '#ccc';
          })
          .attr("stroke", "#333") // Add stroke for better visibility
          .on("click", clicked)
        .append("title")
          .text(d => `${d.properties.NAME || "Unnamed"}: ${d.properties.NAME ? $heatmapData.find(h => h.country === d.properties.NAME)?.totalBudget || 'No data' : 'No data'}`);

      svgElement.call(zoom);
    } catch (error) {
      console.error("Error loading or processing map data:", error);
    }
  });

  function clicked(event, d) {
    // You can also implement specific actions when a country is clicked
    console.log(`${d.properties.NAME} clicked.`);
  }
</script>

<svg bind:this={svg}></svg>

<style>
  svg {
    width: 100%;
    height: auto;
    border: 1px solid black; 
  }
</style>
