import {lazy} from 'react';
import type {ComponentType, LazyExoticComponent} from 'react';

/** Props the course route passes to a lab entrypoint. */
export interface LabEntrypointProps {
  /** Advance to the next level (reports a milestone, then navigates). */
  onContinue?: () => void;
}

type LazyLabComponent = LazyExoticComponent<ComponentType<LabEntrypointProps>>;

const appNameEntrypoints: Record<string, LazyLabComponent> = {
  fish: lazy(() => import('@/modules/labs/oceans')),
  standalone_video: lazy(() => import('@/modules/labs/standaloneVideo')),
};

export function getLabEntrypointByAppName(
  appName: string,
): LazyLabComponent | undefined {
  return appNameEntrypoints[appName];
}
