<script>
  import RadialBarChart from './components/RadialBarChart.svelte';
</script>

<main>
    <h1>Unveiling 17 Years of ERC Grants: A Data-Driven Exploration</h1>
    <h2>Subtitle: Discover the trends, patterns, and stories behind the European Research Council's funding initiatives from 2007 to 2023.</h2>

    <p><strong>Introduction:</strong></p>
    <p>Embark on a journey through time as we delve into the fascinating world of ERC grants, spanning an impressive 17 years of groundbreaking research and innovation. Our interactive web page presents a comprehensive visualization of the grants' budgets, types, and geographical distribution, allowing you to explore and understand the intricate landscape of European research funding like never before.</p>

    <h3>Section 1: Grants Budgets Per Grant Type Over the Years</h3>
    <RadialBarChart />

    <h3>Section 2: Dynamic Radar Plot - Relative Budget Per Grant Type</h3>
    <p>Dive deeper into the data with our interactive radar plot, which allows you to analyze the relative budget allocation for each grant type on a yearly basis. Select a specific year from the drop-down menu and watch as the radar plot adjusts to reveal the unique funding landscape of your chosen timeframe. This dynamic visualization offers unparalleled insights into the ERC's strategic priorities and resource allocation trends.</p>

    <h3>Section 3: Heatmap - Total Budget Received Per Country</h3>
    <p>Lastly, gain a new perspective on the geographical distribution of ERC funding with our engaging heatmap. This visually striking representation highlights each country's total budget received, with a color gradient indicating the grant levels. Observe the concentration of research funding in various European countries and identify emerging patterns, disparities, and potential collaborations in the process.</p>

    <h3>Conclusion:</h3>
    <p>Our web page aims to provide a comprehensive and engaging narrative around ERC grants data, inviting users to explore, interact, and gain valuable insights into the ever-evolving world of European research funding. Join us on this data-driven journey and uncover the stories behind 17 years of groundbreaking research and innovation.</p>
</main>

<style>
  main {
    max-width: 800px;
    margin: auto;
    padding: 1rem;
  }
</style>
