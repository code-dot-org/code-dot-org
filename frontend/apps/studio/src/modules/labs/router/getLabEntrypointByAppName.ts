import {lazy} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LazyLabComponent = React.LazyExoticComponent<React.ComponentType<any>>;

const appNameEntrypoints: Record<string, LazyLabComponent> = {
  fish: lazy(() => import('@/modules/labs/oceans')),
  standalone_video: lazy(() => import('@/modules/labs/videoStub')),
};

export function getLabEntrypointByAppName(
  appName: string,
): LazyLabComponent | undefined {
  return appNameEntrypoints[appName];
}
