// Manages the current dataset load ID to ensure that any outdated loads are discarded.
let currentLoadId = 0;

export const getDatasetLoadId = (): number => currentLoadId;

export const invalidatePendingDatasetLoads = (): void => {
  currentLoadId++;
};

export const isCurrentDatasetLoad = (loadId: number): boolean =>
  loadId === currentLoadId;
