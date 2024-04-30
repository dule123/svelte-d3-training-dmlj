// @ts-nocheck
import { readable, derived } from 'svelte/store';
import { csv, autoType, groups } from 'd3';

const dataPath = 'https://raw.githubusercontent.com/dule123/svelte-d3-training-dmlj/main/data/erc_d3.csv';

export const data = readable([], async (set) => {
  const loadedData = await csv(dataPath, autoType);
  set(loadedData);
});

export const dataByYear = derived(data, $data => {
  return groups($data, d => d.Year).map(([key, values]) => {
    return {
      key,
      values
    };
  });
});

export const dataByGrantType = derived(data, $data => {
  return groups($data, d => d.GrantType).map(([key, values]) => {
    return {
      key,
      values
    };
  });
});