import {translate} from '../localization';

import styles from './NodeNote.module.css';
import {useNoteDraft} from './useNoteDraft';

export interface NodeNoteProps {
  /** The note as stored, or undefined when the node has none. */
  note: string | undefined;
  /** Name of the node, for describing the controls. */
  nodeLabel: string;
  onChange: (note: string | undefined) => void;
  /** Show an existing note but offer no way to write or change one. */
  readOnly?: boolean;
}

/**
 * A note about what one node is for, shown beside it while it is selected.
 *
 * Selection is the whole gating rule: a graph annotated end to end would be
 * unreadable if every bubble were on screen at once, and the notes are there
 * to answer "what is this bit doing" — a question you ask about the thing you
 * just clicked. Deselect and the workspace is a workspace again. A note that
 * should always be visible is a Comment node instead.
 *
 * The same slot to the left of the node holds both states, so the button that
 * creates a note sits exactly where the note will appear. An empty note is no
 * note: clearing the text removes it and the button comes back.
 *
 * Typing is local until it finishes — see `useNoteDraft` for why.
 */
export function NodeNote({
  note,
  nodeLabel,
  onChange,
  readOnly = false,
}: NodeNoteProps) {
  const {draft, editing, inputRef, begin, setDraft, commit} = useNoteDraft(
    note,
    onChange,
  );

  // Nothing to show and nothing to offer: a read-only node with no note has no
  // note slot at all, rather than a button that cannot be pressed.
  if (note === undefined && readOnly) {
    return null;
  }

  if (note === undefined && !editing) {
    return (
      <div className={styles.slot}>
        <button
          type="button"
          // React Flow's own opt-outs: without them a press here starts a node
          // drag, and the button never sees the click.
          className={`${styles.add} nodrag nopan`}
          aria-label={translate('Add a note to {name}', {name: nodeLabel})}
          title={translate('Explain what this node is doing here')}
          onClick={begin}
        >
          💬
        </button>
      </div>
    );
  }

  return (
    <div className={styles.slot}>
      {editing && !readOnly ? (
        <textarea
          ref={inputRef}
          className={`${styles.editor} nodrag nopan nowheel`}
          value={draft ?? ''}
          rows={3}
          placeholder={translate('What is this node for?')}
          aria-label={translate('Note about {name}', {name: nodeLabel})}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            // Enter belongs to the text. Escape finishes rather than cancels:
            // silently discarding a paragraph someone just wrote is a worse
            // surprise than keeping it, and deleting it is one gesture away.
            if (event.key === 'Escape') {
              event.stopPropagation();
              commit();
              return;
            }
            // Typing must not reach the canvas, where single letters are
            // shortcuts and Backspace deletes the selected node.
            event.stopPropagation();
          }}
          onBlur={commit}
        />
      ) : (
        <button
          type="button"
          className={`${styles.bubble} nodrag nopan`}
          disabled={readOnly}
          aria-label={
            readOnly
              ? translate('Note about {name}', {name: nodeLabel})
              : translate('Edit the note about {name}', {name: nodeLabel})
          }
          title={readOnly ? undefined : translate('Click to edit this note')}
          onClick={begin}
        >
          {note}
        </button>
      )}
    </div>
  );
}
