/**
 * InputDialog — blocks execution until the learner supplies a string value.
 *
 * Responds to the Python `input()` call.  The worker sends
 * `{ type: 'input_request', prompt }` which causes PyodideProvider to dispatch
 * REQUEST_INPUT.  NotebookView renders this dialog when pendingInputMessage is
 * non-null; on submit it calls respondToInput which posts `input_response` back
 * to the worker.
 *
 * There is intentionally no cancel path: Python execution is suspended in the
 * worker waiting for a response, so the user must either submit a value or
 * reload the page.
 */

import {useState} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for InputDialog. */
export interface InputDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean;
  /**
   * Prompt text emitted by the Python `input()` call.
   * When empty, a generic fallback title is shown.
   */
  prompt: string;
  /**
   * Called when the user submits a value.
   * @param value The string the learner entered.
   */
  onSubmit: (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Modal dialog that collects a string value for Python's `input()`.
 *
 * Submission is disabled while the text field is empty to prevent the worker
 * from receiving an unintentional blank response.  The field is auto-focused so
 * the learner can type immediately without an extra click.
 */
export function InputDialog({
  open,
  prompt,
  onSubmit,
}: InputDialogProps): React.ReactElement {
  /** Current value of the text field. */
  const [value, setValue] = useState('');

  /**
   * Submits the current value and resets the field.
   * Guards against an empty string even though the button is disabled when
   * empty, in case the caller invokes this path another way.
   */
  function handleSubmit(): void {
    if (value.trim() === '') return;
    const submitted = value;
    setValue('');
    onSubmit(submitted);
  }

  /**
   * Forwards Enter-key presses in the TextField to handleSubmit so the learner
   * does not have to reach for the button.
   * @param evt Keyboard event from the text field
   */
  function handleKeyDown(evt: React.KeyboardEvent<HTMLInputElement>): void {
    if (evt.key === 'Enter') {
      handleSubmit();
    }
  }

  /** Effective title: prompt text or a generic fallback when blank. */
  const title = prompt.trim() !== '' ? prompt : 'Enter a value';

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{pt: 1}}>
        <TextField
          autoFocus
          fullWidth
          variant="outlined"
          value={value}
          onChange={evt => setValue(evt.target.value)}
          onKeyDown={handleKeyDown}
          label="Your answer"
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          disabled={value.trim() === ''}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
