import {type Dataset, getRawDatasets} from '@cdo/apps/ailab/engine';

export type AilabDataset = Dataset;

// Read AI Lab's own dataset list so the lesson generator's
// dataset enum tracks the same catalogue without drift. Uses the raw
// variant because the lesson generator never mounts the lab, so its
// I18n has not been initialised at import time and localizing here
// would throw.
export const AILAB_DATASETS: AilabDataset[] = getRawDatasets();
