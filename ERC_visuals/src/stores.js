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
