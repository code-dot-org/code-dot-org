import {lazy} from 'react';

import {isLab, type Lab} from '@/modules/labs/types/lab';

type LabEntrypointMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [labType in Lab]: React.LazyExoticComponent<React.ComponentType<any>>;
};

const LabEntrypoints: LabEntrypointMap = {
  ['music']: lazy(() => import('@code-dot-org/music-lab')),
};

/**
 * Resolves and returns the appropriate lab entrypoint component based on the provided lab type.
 * @param labType - The type of lab for which to retrieve the entrypoint component.
 * @returns A lazy-loaded React component for the specified lab type, or undefined if the lab type is unrecognized.
 */
export const getLabEntrypoint = (labType: string) => {
  if (!isLab(labType)) {
    return undefined;
  }

  return LabEntrypoints[labType];
};
