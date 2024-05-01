<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { totalBudgetByGrantTypeAllYears } from '../stores';

  let panelData = [];

  function drawMultiPanelChart(data) {
    const container = d3.select('#multiPanelChart');
    container.selectAll("*").remove(); // Clear previous contents

    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 600, height = 400;
    const panelWidth = width / 3;
    const panelHeight = height / 2;

    // Create a scale for x-axis (years)
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d3.min(d.budgets, b => b.year)), d3.max(data, d => d3.max(d.budgets, b => b.year))])
      .range([margin.left, panelWidth - margin.right]);

    // Create a scale for y-axis (total budget)
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(d.budgets, b => b.value)) / 1000000]) // Divide max value by 1,000,000
      .range([panelHeight - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create SVG elements for each panel
    const panels = container.selectAll(".panel")
      .data(data)
      .join("g")
      .attr("class", "panel")
      .attr("transform", (d, i) => `translate(${(i % 3) * panelWidth}, ${Math.floor(i / 3) * panelHeight})`);

    panels.selectAll("path")
      .data(d => [d]) // Ensure each grant type data object is wrapped in an array
      .join("path")
      .attr("d", d => d3.line()
        .x(b => xScale(b.year))
        .y(b => yScale(b.value / 1000000))(d.budgets)) // Divide value by 1,000,000
      .attr("fill", "none")
      .attr("stroke", (d, i) => colorScale(i))
      .attr("stroke-width", 2);

    // Add invisible circles to each data point
    panels.selectAll(".point")
      .data(d => d.budgets)
      .join("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.value / 1000000))
      .attr("r", 4)
      .style("opacity", 0) // Make circles visible by default
      .attr("pointer-events", "all") // Allow circle to capture mouse events
      .on("mouseenter", handleMouseEnter)
      .on("mouseleave", handleMouseLeave);

    // Define event handlers
    function handleMouseEnter(event, d) {
      d3.select(this).style("opacity", 1); // Highlight hovered circle
      // Find closest data point on the line
      const year = d.year;
      const closestDataPoint = data.map(d => {
        const index = d.budgets.findIndex(b => b.year === year);
        return index >= 0 ? d.budgets[index] : null;
      }).filter(d => d);
      // Highlight corresponding data points on other panels
      panels.selectAll(".point")
        .filter(d => closestDataPoint.some(c => c.year === d.year))
        .style("opacity", 1);
    }

    function handleMouseLeave() {
      d3.selectAll(".point").style("opacity", 0); // Reset opacity for all circles
    }

// Add legend text above the circles for each panel
panels.selectAll(".point")
  .on("mouseenter", function(event, d) {
    const year = d.year;
    const value = d.value;
    
    // Add legend text above the circle in all panels
    container.selectAll(".legend").remove(); // Remove existing legend text
    panels.append("text")
      .attr("class", "legend")
      .attr("x", xScale(year) + 10)
      .attr("y", yScale(value / 1000000) - 10) // Adjust y position as needed
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-size", "12px")
      .text(`Year: ${year}\nBudget: ${value}`);

    // Highlight corresponding data points on all panels
    panels.selectAll(".point")
      .filter(d => d.year === year)
      .style("opacity", 1);
  })
  .on("mouseleave", function() {
    // Remove legend text on mouse leave
    container.selectAll(".legend").remove();
    
    // Reset opacity for all circles
    panels.selectAll(".point").style("opacity", 0);
  });
    // Draw x-axis for each panel
    panels.append("g")
      .attr("transform", `translate(0, ${panelHeight - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickFormat((d, i) => i % 2 === 0 ? d : null)); // Show labels for every other year

    // Draw y-axis for each panel
    panels.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${d}`)
        .ticks(yScale.domain()[1] / 200)); // Set number of ticks based on domain range
    // Draw y-axis for each panel
    // panels.append("g")
    //   .attr("transform", `translate(${margin.left}, 0)`)
    //   .call(d3.axisLeft(yScale).tickFormat(d => `${d}`)); // Format y-axis ticks to display in millions

    // Add y-axis label to the leftmost panels
    if (panels.nodes().length >= 4) {
      const leftPanels = panels.filter((d, i) => i === 0 || i === 3);

      leftPanels.append("text")
        .attr("x", -margin.left -30) // Decrease x-coordinate to move left
        .attr("y", -85 + panelHeight / 2)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-weight", "bold")
        .text("Total budget, in M€");   
    }

    // Add titles for each panel
    panels.append("text")
      .attr("x", 10 + panelWidth / 2 )
      .attr("y", margin.top - 8)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text(d => d.grantType);


}


// Redraw the chart when data updates
$: {
  if (panelData.length > 0) {
    drawMultiPanelChart(panelData);
  }
}

// Load and process data on mount
onMount(async () => {
  if (panelData.length > 0) {
    drawMultiPanelChart(panelData);
  }
});

$: panelData = $totalBudgetByGrantTypeAllYears;

</script>


<svg id="multiPanelChart" width="600" height="400"></svg>