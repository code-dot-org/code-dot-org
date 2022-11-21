import I18n from "./i18n";

// Cached copy of the localized datasets manifest.
let allDatasets;

export function getAvailableDatasets(specificDatasets) {
  const datasets = getDatasets();
  // Filter datasets by a specified array (in Levelbuilder) or filter out toy datasets.
  let availableDatasets = (specificDatasets && specificDatasets.length > 1) ?
    datasets.filter(dataset => specificDatasets.includes(dataset.id)) :
    datasets.filter(dataset => !dataset.isToy);

  // Sort dataset names by alphabetical order.
  return availableDatasets.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns all the dataset information stored in the datasets manifest.
 * @returns {Object[]}
 */
export function getDatasets() {
  // Cache the localization since this shouldn't change.
  if (!allDatasets) {
    allDatasets = localizeDatasets(require("../public/datasets-manifest.json").datasets);
  }
  return allDatasets;
}

/**
 * Modifies the given datasets to have localized values.
 * @param datasets {Object[]} Array of information about datasets. Modifies the given objects.
 * @returns {Object[]} The given datasets.
 */
export function localizeDatasets(datasets) {
  return datasets.map(dataset => {
    dataset.name = getDatasetName(dataset);
    return dataset;
  })
}

/**
 * Returns the localized 'name' for the given dataset.
 * @param dataset
 * @returns {string}
 */
function getDatasetName(dataset) {
  const fallback = dataset.name;
  return I18n.t("name", { scope: ["datasets", dataset.id], default: fallback})
}
