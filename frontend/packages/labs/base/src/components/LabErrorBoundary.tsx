import type {PropsWithChildren} from 'react';

// From react-query directly: core does not re-export third-party symbols.
import {QueryErrorResetBoundary} from '@tanstack/react-query';

import LabRegistry from '../LabRegistry';
import {labActions} from '../redux';
import {useAppDispatch} from '../redux/store';

import ErrorBoundary from './ErrorBoundary';
import ErrorFallbackPage from './errorFallbackPage';

/**
 * The single error surface for a lab load. Renders {@link ErrorFallbackPage}
 * when anything inside it throws, and is the one place lab-load errors are
 * reported.
 *
 * Two error sources funnel here:
 *   - host fetches (level properties / app options) throw directly, via the
 *     queries' `throwOnError`;
 *   - the `loadLab` thunk records its failure in redux, which
 *     `useThrowIfPageError` re-throws during render.
 *
 * Wrapped in `QueryErrorResetBoundary` so the fallback's "Try again" resets the
 * failed queries and clears the redux page error, retrying in place rather than
 * forcing a full reload.
 */
export default function LabErrorBoundary({children}: PropsWithChildren) {
  const dispatch = useAppDispatch();

  return (
    <QueryErrorResetBoundary>
      {({reset: resetQueries}) => (
        <ErrorBoundary
          onError={(error, componentStack) =>
            LabRegistry.metricsReporter.logError(error.message, error, {
              componentStack,
            })
          }
          onReset={() => {
            // Clear the load error transport and the failed queries so the
            // retry re-fetches instead of throwing again immediately.
            dispatch(labActions.clearPageError());
            resetQueries();
          }}
          fallback={({reset}) => <ErrorFallbackPage onReload={reset} />}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
