import {type Dataset, getDatasets} from '@code-dot-org/ailab';

export type AilabDataset = Dataset;

// Read the AI Lab package's own dataset list so the lesson generator's
// dataset enum tracks the same catalogue without drift.
export const AILAB_DATASETS: AilabDataset[] = getDatasets();
