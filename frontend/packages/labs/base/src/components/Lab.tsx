import type {PropsWithChildren} from 'react';
import {Suspense, useCallback} from 'react';

import {LevelPropertiesProvider} from '../contexts/LevelPropertiesContext';
import type {LevelPropertiesMap} from '../types';

import ErrorBoundary from './ErrorBoundary';
import Loading from './Loading';

export interface LabProps extends PropsWithChildren {
  levelId?: number;
  levelPropertiesMap?: LevelPropertiesMap;
  onError?: (error: Error, componentStack: string) => void;
}

const ERROR_MESSAGE =
  'An error occurred while loading the lab. Try reloading the page.';

export default function Lab({
  levelId,
  levelPropertiesMap,
  onError,
  children,
}: LabProps) {
  const handleError = useCallback(
    (error: Error, componentStack: string) => {
      (onError ?? defaultOnError)(error, componentStack);
    },
    [onError],
  );

  const content =
    levelId != null && levelPropertiesMap ? (
      <LevelPropertiesProvider
        levelId={levelId}
        levelPropertiesMap={levelPropertiesMap}
      >
        {children}
      </LevelPropertiesProvider>
    ) : (
      children
    );

  return (
    <ErrorBoundary
      key={levelId}
      fallback={<p role="alert">{ERROR_MESSAGE}</p>}
      onError={handleError}
    >
      <Suspense fallback={<Loading />}>{content}</Suspense>
    </ErrorBoundary>
  );
}

function defaultOnError(error: Error, componentStack: string) {
  console.error('[Lab] render error:', error, componentStack);
}
