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

const ERROR_MESSAGE =
  'An error occurred while loading the lab. Try reloading the page.';

export default function Lab({
  levelId,
  levelPropertiesMap,
  onError,
  children,
}: LabProps) {
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = useCallback(
    (error: Error, componentStack: string) => {
      setErrorMessage(ERROR_MESSAGE);
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
      {errorMessage && (
        <div role="alert" aria-live="assertive" aria-atomic="true">
          {errorMessage}
        </div>
      )}
      <ErrorBoundary
        key={levelId}
        fallback={<p>{ERROR_MESSAGE}</p>}
        onError={handleError}
      >
        <Suspense fallback={<Loading />}>{content}</Suspense>
      </ErrorBoundary>
    </>
  );
}

function defaultOnError(error: Error, componentStack: string) {
  console.error('[Lab] render error:', error, componentStack);
}
