/**
 * FilePicker — inline file-selection affordance for .ipynb files.
 *
 * Not a dialog.  Renders a single outlined MUI Button that, when clicked,
 * opens the browser's native file picker filtered to `.ipynb` files.  A
 * hidden `<input type="file">` is driven via a ref so no native input chrome
 * is exposed to the user.
 *
 * Errors from `importFromFile` are surfaced via the `onError` callback so
 * the parent can decide how to display them (inline alert, snackbar, etc.)
 * rather than this component hardcoding a presentation choice.
 *
 * Strings are hard-coded in English for Phase 7.  The shape mirrors what
 * `useString()` would return so Phase 12 can drop the i18n hook in without
 * structural changes.
 */

import {useRef, useCallback} from 'react';
import {Button, SvgIcon} from '@mui/material';
import {importFromFile, ImportError} from '../storage/importer';
import type {ImportResult} from '../storage/importer';

// ---------------------------------------------------------------------------
// String constants (Phase 12: replace with useString() calls)
// ---------------------------------------------------------------------------

/** Visible label on the file-picker button. */
const STR_BUTTON_LABEL = 'Open .ipynb file';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

/**
 * UploadFileIcon — Material Design "upload file" icon rendered as an inline
 * SVG.  Replaces `@mui/icons-material/UploadFile` which is not yet installed
 * in this workspace; the path data is identical to the MUI source.
 */
function UploadFileIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm-1 7l-4 4-4-4h2.5V9h3v4H13zm1-7H6v16h12V8h-4V2z" />
    </SvgIcon>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for FilePicker. */
export interface FilePickerProps {
  /** Session ID passed through to the importer. */
  sessionId: string;
  /** Called after a successful import with the resulting notebook. */
  onImported: (result: ImportResult) => void;
  /** Called when the import fails so the parent can surface the error. */
  onError: (err: ImportError) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Inline button that opens the native OS file picker for `.ipynb` files.
 *
 * Importing is handled entirely within the component; success and failure
 * are delegated to `onImported` / `onError` props.  The hidden input is
 * reset after each selection so selecting the same file twice in a row fires
 * a change event both times.
 */
export function FilePicker({
  sessionId,
  onImported,
  onError,
}: FilePickerProps): React.ReactElement {
  /** Ref to the hidden file input element. */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Programmatically opens the file picker by clicking the hidden input.
   */
  const handleButtonClick = useCallback((): void => {
    inputRef.current?.click();
  }, []);

  /**
   * Handles the file-selected event from the hidden input.
   * Reads the selected file, delegates to `importFromFile`, and routes the
   * result or error to the appropriate callback.  The input value is cleared
   * after handling so that choosing the same file a second time still fires
   * a change event.
   *
   * @param evt Change event carrying the selected FileList
   */
  const handleFileChange = useCallback(
    async (evt: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = evt.target.files?.[0];
      if (inputRef.current) {
        // Reset so the same file can be selected again.
        inputRef.current.value = '';
      }
      if (file === undefined) return;

      try {
        const result = await importFromFile(file, sessionId);
        onImported(result);
      } catch (err) {
        if (err instanceof ImportError) {
          onError(err);
        } else {
          // Wrap unexpected errors in ImportError so the parent always
          // receives a typed value through the onError channel.
          onError(new ImportError('unknown', String(err)));
        }
      }
    },
    [sessionId, onImported, onError]
  );

  return (
    <>
      {/* Hidden file input — driven by the button below via inputRef. */}
      <input
        ref={inputRef}
        type="file"
        accept=".ipynb"
        style={{display: 'none'}}
        onChange={evt => void handleFileChange(evt)}
      />

      <Button
        variant="outlined"
        startIcon={<UploadFileIcon />}
        onClick={handleButtonClick}
      >
        {STR_BUTTON_LABEL}
      </Button>
    </>
  );
}
