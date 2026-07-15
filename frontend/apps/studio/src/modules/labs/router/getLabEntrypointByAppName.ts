import {lazy} from 'react';
import type {ComponentType, LazyExoticComponent} from 'react';

// Lab entrypoints are self-contained: the host renders them with no props.
type LazyLabComponent = LazyExoticComponent<ComponentType>;

const appNameEntrypoints: Record<string, LazyLabComponent> = {
  fish: lazy(() => import('@/modules/labs/oceans')),
  standalone_video: lazy(() => import('@/modules/labs/standaloneVideo')),
};

export function getLabEntrypointByAppName(
  appName: string,
): LazyLabComponent | undefined {
  return appNameEntrypoints[appName];
}
