import {lazy, type ComponentType, type LazyExoticComponent} from 'react';

import {isLab, LAB_REGISTRY, type Lab} from '@/modules/labs/config/labs';
import type {LabEntrypointProps} from '@/modules/labs/types/labEntrypoint';

// Pre-build one lazy component per registered lab, created once at module load
// so navigating back to a lab reuses the same component (no remount). Each
// lab's chunk is still fetched on first use only — `lazy` defers the registry's
// static `import()` until the component first renders.
const LabEntrypoints = Object.fromEntries(
  Object.entries(LAB_REGISTRY).map(([labType, {load}]) => [
    labType,
    lazy(load),
  ]),
) as Record<Lab, LazyExoticComponent<ComponentType<LabEntrypointProps>>>;

/**
 * Resolves the lazy-loaded entrypoint component for a lab type. The component
 * is the lab package's own default export (e.g. `@code-dot-org/music-lab`),
 * rendered by the host through `StudioLabHost`.
 * @param labType - The `$labType` route segment.
 * @returns The lab's lazy entrypoint component, or undefined if unrecognized.
 */
export const getLabEntrypoint = (labType: string) => {
  if (!isLab(labType)) {
    return undefined;
  }

  return LabEntrypoints[labType];
};
