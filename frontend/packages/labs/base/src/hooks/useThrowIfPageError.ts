import {useAppSelector} from '../redux/store';

/**
 * Bridges the redux page error into a React error boundary.
 *
 * The `loadLab` thunk records its failure in `state.lab.pageError` because an
 * async thunk rejection cannot be caught by an error boundary directly. Calling
 * this hook inside the boundary re-throws that error during render, so a single
 * boundary renders the error UI for both host fetch failures (thrown by the
 * queries) and load failures (surfaced here).
 *
 * The boundary's reset must clear `pageError` (dispatch `clearPageError`) before
 * re-rendering, otherwise this would throw again immediately.
 */
export function useThrowIfPageError() {
  const pageError = useAppSelector(state => state.lab.pageError);

  if (pageError) {
    // Throw a fresh error carrying the page error's message (so telemetry and
    // the boundary agree), keeping the original as `cause`. Don't mutate the
    // redux-held error.
    throw new Error(pageError.errorMessage, {cause: pageError.error});
  }
}
