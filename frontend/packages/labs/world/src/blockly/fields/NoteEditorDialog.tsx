// Writing the prose that a `world_doc` block draws.
//
// The source on the left and the block's own rendering on the right, updating
// as it is typed — the same renderer the block uses, so what is seen here is
// what will be on the block rather than an approximation of it.
//
// NOT a WYSIWYG surface yet, and deliberately: the block is the hard part and
// it is worth being sure of before a rich-text editor and its dependency are
// spent on this. Markdown typed into a box is legible, needs nothing new, and
// is what the second half replaces when it earns its place.

import {useState} from 'react';

import {BlocklyMarkdown} from '@code-dot-org/blockly';
import {Dialog} from '@code-dot-org/component-library/dialog';

import blockStyles from './fieldMarkdown.module.css';
import styles from './noteEditorDialog.module.css';

export interface NoteEditorDialogProps {
  /** The markdown as it stands. */
  value: string;
  onSave: (markdown: string) => void;
  onCancel: () => void;
}

export const NoteEditorDialog = ({
  value,
  onSave,
  onCancel,
}: NoteEditorDialogProps) => {
  const [draft, setDraft] = useState(value);

  return (
    <Dialog
      role="dialog"
      title="Note"
      description="Documentation for whoever reads this next. It changes nothing about what runs."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{children: 'Save', onClick: () => onSave(draft)}}
      secondaryButtonProps={{children: 'Cancel', onClick: onCancel}}
      customContent={
        <div className={styles.panes}>
          <label className={styles.pane}>
            <span className={styles.label}>Markdown</span>
            <textarea
              className={styles.source}
              value={draft}
              spellCheck
              onChange={event => setDraft(event.target.value)}
              aria-label="Markdown source"
            />
          </label>
          <div className={styles.pane}>
            <span className={styles.label}>On the block</span>
            {/* The block's own renderer AND its own styles, so this is the
                thing itself rather than a page-sized impression of it. */}
            <div className={`${styles.preview} ${blockStyles.body}`}>
              <BlocklyMarkdown content={draft} />
            </div>
          </div>
        </div>
      }
    />
  );
};
