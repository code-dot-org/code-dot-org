import manifest from '../../../../../frontend/packages/labs/ailab/public/datasets-manifest.json';

export interface AilabDataset {
  id: string;
  name: string;
  isToy?: boolean;
}

// Single source of truth: the manifest the AI Lab package itself reads
// at runtime. Re-imported here so the lesson generator's dataset enum
// tracks the same list without drift.
export const AILAB_DATASETS: AilabDataset[] = manifest.datasets.map(d => ({
  id: d.id as string,
  name: d.name as string,
  isToy: 'isToy' in d ? Boolean(d.isToy) : undefined,
}));

export type AilabDatasetId = string;
