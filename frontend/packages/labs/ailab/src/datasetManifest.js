export const allDatasets = require("../public/datasets/manifest.json").datasets;

export function getAvailableDatasets(specificDatasets) {
  // Filter datasets by a specified array (in Levelbuilder) or filter out toy datasets.
  let availableDatasets = (specificDatasets && specificDatasets.length > 1) ?
    allDatasets.filter(dataset => specificDatasets.includes(dataset.id)) :
    allDatasets.filter(dataset => !dataset.isToy);

  // Sort dataset names by alphabetical order.
  return availableDatasets.sort((a, b) => a.name.localeCompare(b.name));
}
