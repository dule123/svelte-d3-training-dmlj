<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { feature } from 'topojson-client';
  import { heatmapData } from '../stores';

  let svg;

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
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

    try {
      const response = await fetch("/data/europe.topojson");
      if (!response.ok) throw new Error('Failed to fetch Europe TopoJSON: ' + response.status);
      const europe = await response.json();

      console.log("TopoJSON loaded, keys available:", Object.keys(europe.objects)); // Log to check keys

      // Assuming the correct key is 'countries' based on your initial structure post
      const countries = feature(europe, europe.objects.countries).features;

      const g = svgElement.append("g");

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
  });

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

<style>
  svg {
    width: 100%;
    height: auto;
    border: 1px solid black; 
  }
</style>
