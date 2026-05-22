/**
 * CodeControls — action button row for a code cell.
 *
 * Renders three controls:
 *   - "Try it" (primary, contained): runs the cell; disabled while the worker
 *     is not idle/ready.
 *   - "Stop" (outlined, error colour): terminates execution; visible only
 *     while workerStatus === 'running'.
 *   - "↺ Reset" (text, secondary colour): clears Python globals; disabled
 *     while the worker is running.
 *
 * All imperative runtime calls go through the hooks exported from
 * runtimeStore so this component never touches the worker directly.
 */

import { useCallback } from 'react';
import { Box, Button } from '@mui/material';
import {
  useWorkerStatus,
  useRunCell,
  useStopCell,
  useResetGlobals,
} from '../../runtime/runtimeStore';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for CodeControls. */
export interface CodeControlsProps {
  /** Stable identifier of the cell these controls belong to. */
  cellId: string;
  /**
   * Current source lines of the cell.  Joined before being sent to the
   * worker so the caller is never responsible for that concatenation.
   */
  source: string[];
  /**
   * Optional callback invoked synchronously before the run is dispatched.
   * Use it to flush any unsaved editor content into `source` so the worker
   * receives the latest code.
   */
  onBeforeRun?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the worker is in a state where a new run may be started.
 * @param status Current WorkerStatus
 * @returns Whether a new run can be dispatched
 */
function isRunnable(status: ReturnType<typeof useWorkerStatus>): boolean {
  return status === 'ready';
}

/**
 * Returns true when the Stop button should be visible.
 * @param status Current WorkerStatus
 * @returns Whether the stop affordance should appear
 */
function isWorkerRunning(status: ReturnType<typeof useWorkerStatus>): boolean {
  return status === 'running';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Row of action buttons attached to a single code cell.
 *
 * "Try it" is always rendered but disabled when the worker is busy or
 * initializing.  "Stop" replaces none of the other buttons — it is shown
 * alongside them while the worker is executing so the student can abort
 * without waiting.  "↺ Reset" is always rendered, disabled while running.
 */
export function CodeControls({
  cellId,
  source,
  onBeforeRun,
}: CodeControlsProps): React.ReactElement {
  const workerStatus = useWorkerStatus();
  const runCell = useRunCell();
  const stopCell = useStopCell();
  const resetGlobals = useResetGlobals();

  const runDisabled = !isRunnable(workerStatus);
  const resetDisabled = isWorkerRunning(workerStatus);
  const showStop = isWorkerRunning(workerStatus);

  /** Flushes unsaved content then dispatches a run for this cell. */
  const handleRun = useCallback((): void => {
    onBeforeRun?.();
    runCell(cellId, source.join(''));
  }, [onBeforeRun, runCell, cellId, source]);

  /** Stops the running cell via interrupt buffer or worker respawn. */
  const handleStop = useCallback((): void => {
    stopCell();
  }, [stopCell]);

  /** Clears all user-defined Python globals in the worker. */
  const handleReset = useCallback((): void => {
    resetGlobals();
  }, [resetGlobals]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant="contained"
        size="small"
        disabled={runDisabled}
        onClick={handleRun}
      >
        Try it
      </Button>

      {showStop && (
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={handleStop}
        >
          Stop
        </Button>
      )}

      <Button
        variant="text"
        size="small"
        color="secondary"
        disabled={resetDisabled}
        onClick={handleReset}
      >
        ↺ Reset
      </Button>
    </Box>
  );
}
