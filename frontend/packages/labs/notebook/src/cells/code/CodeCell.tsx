/**
 * Code cell component for Phase 4.
 *
 * Renders a CodeMirror editor, a "Try it" run button, and a unified output
 * region.  Error runs surface an EmpathyCard with a "Try again" button;
 * the offending line is highlighted in the editor via the `highlightLine`
 * prop on CodeEditor.
 *
 * Input prompts (Python's input()) are surfaced as an inline text field when
 * `pendingInputMessage` is non-null and this cell is the running one.
 *
 * Phase 9: `#@param`-annotated source lines are parsed on each render and
 * displayed as labelled controls above the editor.  Changing a control
 * rewrites the corresponding source line in place and briefly highlights it.
 *
 * Phase 10: inline "Try it" Button replaced with CodeControls, which adds
 * Stop and Reset Globals affordances.
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import type { Cell, NotebookMetadata } from '../../storage/NotebookLabDB';
import { resolveSource } from '../../runtime/globalsTemplating';
import {
  useCellOutput,
  useRunCell,
  useRespondToInput,
  useRuntimeState,
} from '../../runtime/runtimeStore';
import { CodeEditor } from './CodeEditor';
import { OutputRegion } from './OutputRegion';
import { extractException } from './extractException';
import { ParameterControls } from './ParameterControls';
import { parseParameters } from './parameterParser';
import { CodeControls } from './CodeControls';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for CodeCell. */
interface CodeCellProps {
  /** Cell object from the notebook. */
  cell: Cell;
  /** Notebook globals for template substitution. */
  globals?: NotebookMetadata['globals'];
  /** Active locale for i18n and globals resolution. */
  locale: string;
  /** Called when cell source changes. */
  onSourceChange: (cellId: string, newSource: string[]) => void;
}

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

/** Props for InputPrompt sub-component. */
interface InputPromptProps {
  /** Prompt message from Python's input() call. */
  message: string;
  /** Called when the user submits their input. */
  onSubmit: (value: string | null) => void;
}

/**
 * Inline input field shown when the running Python code calls input().
 * Submitting with an empty string sends '' (valid); cancelling sends null,
 * which injects a KeyboardInterrupt in the worker.
 */
function InputPrompt({ message, onSubmit }: InputPromptProps): React.ReactElement {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback((): void => {
    onSubmit(value);
    setValue('');
  }, [onSubmit, value]);

  const handleCancel = useCallback((): void => {
    onSubmit(null);
    setValue('');
  }, [onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') handleCancel();
    },
    [handleSubmit, handleCancel]
  );

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
      {message.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
          {message}
        </Typography>
      )}
      <TextField
        size="small"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        sx={{ flexGrow: 1 }}
      />
      <Button size="small" variant="contained" onClick={handleSubmit}>
        OK
      </Button>
      <Button size="small" onClick={handleCancel}>
        Cancel
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a single code cell: editor + run controls + output area.
 *
 * Source edits are kept in local state and synced upward via `onSourceChange`
 * on every keystroke; the parent is responsible for persisting them.
 */
export function CodeCell({
  cell,
  globals,
  locale,
  onSourceChange,
}: CodeCellProps): React.ReactElement {
  const [source, setSource] = useState<string[]>(cell.source ?? []);

  /**
   * 1-based line number to highlight briefly after a parameter control
   * changes the corresponding source line.  Undefined clears the highlight.
   */
  const [paramHighlightLine, setParamHighlightLine] = useState<number | undefined>(undefined);

  const cellOutput = useCellOutput(cell.id);
  const runCell = useRunCell();
  const respondToInput = useRespondToInput();
  const runtimeState = useRuntimeState();

  const isRunning = cellOutput.state === 'running';

  const showInputPrompt =
    runtimeState.pendingInputMessage !== null &&
    runtimeState.runningCellId === cell.id;

  /**
   * 1-based line number to highlight in the editor.  Error lines take
   * precedence; parameter-change highlights fill in when there is no error.
   */
  const errorHighlightLine =
    cellOutput.error !== null
      ? extractException(cellOutput.error).line
      : undefined;

  const highlightLine = errorHighlightLine ?? paramHighlightLine;

  /** Parameters parsed from the current source lines on every render. */
  const parameters = parseParameters(source);

  /**
   * Handles a source rewrite triggered by a parameter control change.
   * Updates local source state, notifies the parent, and briefly highlights
   * the changed line (600 ms) so the author sees where the edit landed.
   *
   * @param updatedSource - New source lines returned by `updateParameterInSource`.
   * @param lineNumber - Zero-based line index of the changed parameter.
   */
  const handleParameterSourceChange = useCallback(
    (updatedSource: string[], lineNumber: number): void => {
      setSource(updatedSource);
      onSourceChange(cell.id, updatedSource);
      // Convert zero-based lineNumber to 1-based for CodeEditor.
      const oneBased = lineNumber + 1;
      setParamHighlightLine(oneBased);
      setTimeout(() => setParamHighlightLine(undefined), 600);
    },
    [cell.id, onSourceChange]
  );

  /**
   * Wraps `handleParameterSourceChange` so `ParameterControls` receives a
   * single `(updatedSource) => void` callback; the changed line is derived
   * by diffing `updatedSource` against the current `source`.
   *
   * @param updatedSource - Updated source lines from the parameter rewrite.
   */
  const handleParameterControlChange = useCallback(
    (updatedSource: string[]): void => {
      // Find the first line that differs to determine which line to highlight.
      const changedIndex = updatedSource.findIndex((line, i) => line !== source[i]);
      const lineNumber = changedIndex >= 0 ? changedIndex : 0;
      handleParameterSourceChange(updatedSource, lineNumber);
    },
    [source, handleParameterSourceChange]
  );

  const handleEditorChange = useCallback(
    (value: string): void => {
      // Split on newlines while preserving trailing newlines per nbformat convention.
      const lines = value.length === 0 ? [] : value.split('\n').map((l, i, arr) =>
        i < arr.length - 1 ? l + '\n' : l
      );
      setSource(lines);
      onSourceChange(cell.id, lines);
    },
    [cell.id, onSourceChange]
  );

  /**
   * Re-runs the cell with the current resolved source.
   * Wired to the "Try again" button in EmpathyCard via OutputRegion.
   */
  const handleTryAgain = useCallback((): void => {
    const resolvedSource = resolveSource(cell, globals, locale);
    runCell(cell.id, resolvedSource.join(''));
  }, [cell, globals, locale, runCell]);

  /**
   * Flushes the current local source lines into `source` for CodeControls
   * just before a run.  Because `source` is already kept in sync on every
   * editor keystroke this is effectively a no-op; the callback exists so
   * future flush logic (e.g. async editor commit) has a stable hook point.
   */
  const handleBeforeRun = useCallback((): void => {
    // No-op: source state is already current.
  }, []);

  const handleRespondToInput = useCallback(
    (value: string | null): void => {
      respondToInput(value);
    },
    [respondToInput]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
      }}
    >
      {parameters.length > 0 && (
        <ParameterControls
          parameters={parameters}
          source={source}
          onSourceChange={handleParameterControlChange}
        />
      )}

      <CodeEditor
        initialValue={source.join('')}
        onChange={handleEditorChange}
        readOnly={isRunning}
        highlightLine={highlightLine}
      />

      <CodeControls
        cellId={cell.id}
        source={source}
        onBeforeRun={handleBeforeRun}
      />

      {showInputPrompt && runtimeState.pendingInputMessage !== null && (
        <InputPrompt
          message={runtimeState.pendingInputMessage}
          onSubmit={handleRespondToInput}
        />
      )}

      <OutputRegion
        stdout={cellOutput.stdout}
        results={cellOutput.results}
        error={cellOutput.error}
        onTryAgain={handleTryAgain}
      />
    </Box>
  );
}

export default CodeCell;
