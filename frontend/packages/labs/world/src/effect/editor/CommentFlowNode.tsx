import {NodeResizer, type NodeProps} from '@xyflow/react';

import {translate} from '../localization';

import styles from './CommentFlowNode.module.css';
import {useEffectEditorContext} from './EffectEditorContext';
import type {EffectCommentNodeData} from './flowMapping';
import {useNoteDraft} from './useNoteDraft';

/** Small enough to tuck beside a node, big enough to hold a sentence. */
const MIN_WIDTH = 120;
const MIN_HEIGHT = 56;

/**
 * A standalone note in the workspace.
 *
 * Unlike the bubble beside a node, this is always visible — being visible is
 * the entire reason it was placed. It has no ports and no chrome: it is not a
 * step in the effect, and dressing it like one would invite wiring it to
 * something.
 *
 * The text is the same `note` field every node has, which is why this node
 * needed no new model: it is a note with nothing attached to it.
 *
 * It is resizable and draggable from anywhere on its face, because a note is
 * a thing you arrange around a graph rather than a step in one.
 */
export function CommentFlowNode({id, data, selected}: NodeProps) {
  const {node} = data as unknown as EffectCommentNodeData;
  const {setNote, resizeNode, readOnly} = useEffectEditorContext();
  const {draft, editing, inputRef, begin, setDraft, commit} = useNoteDraft(
    node.note,
    value => setNote(id, value),
  );

  return (
    <div
      className={`${styles.comment} ${selected ? styles.selected : ''}`}
      data-testid={`effect-node-${id}`}
    >
      {/* Handles only while selected, so an unselected comment stays a plain
          rectangle of text. Position travels with the size: dragging a top or
          left handle moves the origin too. */}
      <NodeResizer
        isVisible={selected && !readOnly}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        color="var(--effect-editor-accent, #8ab4f8)"
        onResizeEnd={(_event, {x, y, width, height}) =>
          resizeNode(id, {position: {x, y}, size: {width, height}})
        }
      />

      {editing && !readOnly ? (
        <textarea
          ref={inputRef}
          className={`${styles.editor} nodrag nopan nowheel`}
          value={draft ?? ''}
          rows={4}
          placeholder={translate('What should someone know about this effect?')}
          aria-label={translate('Comment')}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
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
          // No `nodrag` here on purpose: this button covers the whole node, so
          // opting out of dragging would leave nowhere to grab a comment by.
          // A press that does not move still delivers its click, so dragging
          // moves the note and clicking opens it for editing.
          className={styles.body}
          disabled={readOnly}
          aria-label={
            readOnly ? translate('Comment') : translate('Edit this comment')
          }
          title={
            readOnly ? undefined : translate('Click to edit, drag to move')
          }
          onClick={begin}
        >
          {node.note ?? (
            // An empty comment still has to be visible, or it could not be
            // clicked into, moved, or deleted.
            <span className={styles.placeholder}>
              {translate('Write a note…')}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
