import {useEffect, useRef, useState} from 'react';

export interface NoteDraft {
  /** The text being typed, or null when not editing. */
  draft: string | null;
  editing: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  /** Start editing from the stored note. */
  begin: () => void;
  setDraft: (text: string) => void;
  /** Stop editing, writing the note only if it actually changed. */
  commit: () => void;
}

/**
 * Hold a note being typed, and write it to the document only when done.
 *
 * Notes end up in the compiled shader as comments, so a write per keystroke
 * recompiles the effect and relinks a WebGL program in every open preview on
 * every character — which both stalls typing and drops characters, as the
 * controlled field chases a document round-trip it cannot keep up with.
 *
 * Shared by the per-node bubble and the standalone comment node so that rule
 * has exactly one implementation to keep true.
 */
export function useNoteDraft(
  note: string | undefined,
  onChange: (note: string | undefined) => void,
): NoteDraft {
  const [draft, setDraft] = useState<string | null>(null);
  const editing = draft !== null;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Keyed on `editing`, not on the draft: refocusing every keystroke would
    // fight the caret.
    const field = inputRef.current;
    if (editing && field) {
      field.focus();
      // Caret at the end rather than selecting everything: these are
      // sentences, and one keystroke should not replace a paragraph someone
      // already wrote.
      field.setSelectionRange(field.value.length, field.value.length);
    }
  }, [editing]);

  return {
    draft,
    editing,
    inputRef,
    begin: () => setDraft(note ?? ''),
    setDraft,
    commit: () => {
      if (draft === null) {
        return;
      }
      const next = draft.trim() ? draft : undefined;
      setDraft(null);
      // A note that did not change is not an edit: no document churn, no
      // recompile, and nothing added to the undo history.
      if (next !== note) {
        onChange(next);
      }
    },
  };
}
