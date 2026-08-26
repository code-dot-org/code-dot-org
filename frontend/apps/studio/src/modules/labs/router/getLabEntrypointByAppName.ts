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
  // Fat-lab mount (@code-dot-org/lab-classic via LabProviders) — see
  // modules/labs/music/index.tsx. Every other entry here is staging's slim
  // @code-dot-org/lab contract; this is the one exception.
  music: lazy(() => import('@/modules/labs/music')),
};

export function getLabEntrypointByAppName(
  appName: string,
): LazyLabComponent | undefined {
  return appNameEntrypoints[appName];
}
