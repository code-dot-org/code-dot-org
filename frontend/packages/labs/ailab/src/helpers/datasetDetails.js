/* Helper functions for getting information about the selected dataset. */

export function getDatasetDetails(state) {
  const datasetDetails = {};
  datasetDetails.name = state.metadata && state.metadata.name;
  datasetDetails.description = getDatasetDescription(state);
  datasetDetails.numRows = state.data.length;
  datasetDetails.isUserUploaded = isUserUploadedDataset(state);
  return datasetDetails;
}

export function getDatasetDescription(state) {
  // If this a dataset from the internal collection that already has a description, use that.
  if (
    state.metadata &&
    state.metadata.card &&
    state.metadata.card.description
  ) {
    return state.metadata.card.description;
  } else if (
    state.trainedModelDetails &&
    state.trainedModelDetails.datasetDescription
  ) {
    return state.trainedModelDetails.datasetDescription;
  } else {
    return undefined;
  }
}


export function isUserUploadedDataset(state) {
  // The csvfile for internally curated datasets are strings; those uploaded by
  // users are objects. Use data type as a proxy to know which case we're in.
  return typeof state.csvfile === "object" && state.csvfile !== null;
}
