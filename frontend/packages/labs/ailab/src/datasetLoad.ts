// parseCSV and parseJSON resolve asynchronously; each captures the load id at
// call time and drops its result if a newer load has started since.
let currentLoadId = 0;

export const getDatasetLoadId = (): number => currentLoadId;

export const invalidatePendingDatasetLoads = (): void => {
  currentLoadId++;
};

export const isCurrentDatasetLoad = (loadId: number): boolean =>
  loadId === currentLoadId;
