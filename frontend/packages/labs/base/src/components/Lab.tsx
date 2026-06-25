import type {PropsWithChildren} from 'react';
import {Suspense, useCallback, useState} from 'react';

import {LevelPropertiesProvider} from '../contexts/LevelPropertiesContext';
import type {LevelPropertiesMap} from '../types';

import ErrorBoundary from './ErrorBoundary';
import Loading from './Loading';

export interface LabProps extends PropsWithChildren {
  levelId?: number;
  levelPropertiesMap?: LevelPropertiesMap;
  onError?: (error: Error, componentStack: string) => void;
}

export default function Lab({
  levelId,
  levelPropertiesMap,
  onError,
  children,
}: LabProps) {
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = useCallback(
    (error: Error, componentStack: string) => {
      setErrorMessage(
        'An error occurred while loading the lab. Try reloading the page.',
      );
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
    <>
      <div role="alert" aria-live="assertive" aria-atomic="true">
        {errorMessage}
      </div>
      <Suspense fallback={<Loading isLoading />}>
        <ErrorBoundary fallback={<p>{errorMessage}</p>} onError={handleError}>
          {content}
        </ErrorBoundary>
      </Suspense>
    </>
  );
}

function defaultOnError(error: Error) {
  console.error('[Lab] render error:', error);
}
