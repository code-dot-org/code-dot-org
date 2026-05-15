import {lazy} from 'react';

import {isLab, type Lab} from '@/modules/labs/types/lab';

/**
 * Props that all studio-side lab entrypoints accept. Lab modules ignore
 * `studioMobile` if they don't care; AI for Oceans uses it to switch on
 * the bundled offline dataset path.
 */
export interface LabEntryProps {
  studioMobile?: boolean;
}

type LabEntrypointMap = {
  [labType in Lab]: React.LazyExoticComponent<React.ComponentType<LabEntryProps>>;
};

const LabEntrypoints: LabEntrypointMap = {
  ['music']: lazy(() => import('@code-dot-org/music-lab')) as unknown as React.LazyExoticComponent<
    React.ComponentType<LabEntryProps>
  >,
  // Oceans is wrapped in a studio-side container that replicates the FishView
  // sizing algorithm (16:9, clamped, proportional font size).
  ['oceans']: lazy(() => import('@/modules/labs/oceans')),
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
