import { readable, derived, writable } from 'svelte/store';
import { csv, autoType, groups, rollup, sum } from 'd3';

const dataPath = 'https://raw.githubusercontent.com/dule123/svelte-d3-training-dmlj/main/data/erc_d3.csv';

// List of all grant types
const allGrantTypes = [
  "Starting Grants",
  "Advanced Grants",
  "Consolidator Grants",
  "Proof Of Concept",
  "Synergy Grants"
];


// Store to load and hold the initial data
export const data = readable([], async (set) => {
  const loadedData = await csv(dataPath, autoType);
  set(loadedData);
});



// Derived store to group data by year and sort the years
export const dataByYear = derived(data, $data => {
  const groupedByYear = groups($data, d => d.Year);
  // Sort the years numerically
  groupedByYear.sort((a, b) => a[0] - b[0]); // Assuming a[0] and b[0] are the year values
  return groupedByYear.map(([key, values]) => ({ key, values }));
});

// Derived store to group data by Grant Type
export const dataByGrantType = derived(data, $data => {
  return groups($data, d => d.GrantType).map(([key, values]) => ({ key, values }));
});

// A writable store for the current year, allows binding and updating from components
export const currentYear = writable(2020);

// Derived store to compute the total budget per Grant Type for the selected year
export const budgetByGrantType = derived([data, currentYear], ([$data, $currentYear]) => {
  console.log("Filtered Data:", $data.filter(d => d.Year === $currentYear)); // Check what the filter returns
  const dataForYear = $data.filter(d => d.Year === $currentYear);
  const budgetData = rollup(dataForYear, v => sum(v, d => d.Budget), d => d.GrantType);

  console.log("Rollup Data:", budgetData); // Inspect the rollup result

  const completeData = allGrantTypes.map(type => {
      return {
          key: type,
          value: budgetData.get(type) || 0 // Check defaults
      };
  });

  console.log("Complete Data for Radar Chart:", completeData); // Final data structure for the chart
  return completeData;
});

// Derived store to compute the maximum sum of grants per grant type across all years
export const maxBudget = derived(data, $data => {
  let maxBudget = 0;

  // Group the data by year and grant type
  const groupedData = rollup($data, 
    v => sum(v, d => d.Budget), // Compute sum of budgets within each group
    d => d.Year, // Group by year
    d => d.GrantType // Then by grant type
  );

  // Loop through the grouped data to find the maximum sum of grants for each year and grant type
  groupedData.forEach((yearData, year) => {
    yearData.forEach((budget, grantType) => {
      maxBudget = Math.max(maxBudget, budget);
    });
  });

  console.log("maxBudget we calculated is: ", maxBudget); //

  return maxBudget;
});

// Derived store to compute the total budget per Grant Type across all years for each panel
export const totalBudgetByGrantTypeAllYears = derived(data, $data => {
  // Group the data by Grant Type
  const budgetData = rollup($data, 
    v => sum(v, d => d.Budget), // Compute sum of budgets within each group
    d => d.GrantType, // Group by grant type
    d => d.Year // Then by year
  );

  // Create an array of objects for each grant type containing data for each year
  const completeData = allGrantTypes.map(type => {
    const grantTypeData = [];
    budgetData.get(type)?.forEach((value, year) => {
      grantTypeData.push({ year, value });
    });
    // Sort the grantTypeData array by year
    grantTypeData.sort((a, b) => a.year - b.year);
    return { grantType: type, budgets: grantTypeData };
  });

  console.log("Complete Data for Panel Chart:", completeData);
  
  return completeData;
});

// Store for selecting a grant type in the heatmap
export const selectedGrantType = writable('Starting Grants');

// Derived store to compute the number of grants per country per grant type per year for the heatmap
export const heatmapData = derived([data, currentYear, selectedGrantType], ([$data, $currentYear, $selectedGrantType]) => {
  const filteredData = $data.filter(d => d.Year === $currentYear && d.GrantType === $selectedGrantType);
  const results = rollup(filteredData,
    (entries) => ({
      count: entries.length,  // Count of grants
      totalBudget: sum(entries, d => d.Budget)  // Sum of budgets
    }),
    d => d.Country  // Group by country
  );

  // Convert Map to an array for easier handling in Svelte components
  const heatmapArray = Array.from(results, ([country, data]) => ({
    country,
    count: data.count,
    totalBudget: data.totalBudget
  }));
  console.log("Complete Data for map Chart:", heatmapArray);
  return heatmapArray;
});

// Function to update the current year
export function setYear(year) {
  currentYear.set(year);
}


