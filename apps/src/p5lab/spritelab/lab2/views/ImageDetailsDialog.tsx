import {CustomDialog} from '@code-dot-org/component-library/dialog';
import TextField from '@code-dot-org/component-library/textField';
import React, {useState} from 'react';

import {ImageGenerationMetadata} from '../types';

import moduleStyles from './image-details-dialog.module.scss';

interface ImageDetailsDialogProps {
  // null = the "new image" state: name it, then paint or generate; nothing
  // is created until one of those succeeds.
  animKey: string | null;
  name?: string;
  thumb?: string;
  generation?: ImageGenerationMetadata;
  onClose: () => void;
  /** Open the paint editor on this image. */
  onPaint: () => void;
  /** Create a new image by painting from a blank canvas; error or null. */
  onCreateFromPaint: (name: string) => string | null;
  /** Rename this image everywhere; error or null. */
  onRename: (newName: string) => string | null;
  onDelete: () => void;
}

const TYPE_LABELS = {
  sprite: 'Sprite',
  background: 'Background',
  block: 'Block',
};
const STYLE_LABELS = {smooth: 'Smooth', pixel: 'Pixel art'};

/**
 * The image dialog's Details view: the image large on the left; its name and
 * how it was made on the right, with edit, rename, and delete. Wears the
 * pixel editor's dark chrome. AI generation hands off to the generate view
 * (next phase).
 */
const ImageDetailsDialog: React.FunctionComponent<ImageDetailsDialogProps> = ({
  animKey,
  name,
  thumb,
  generation,
  onClose,
  onPaint,
  onCreateFromPaint,
  onRename,
  onDelete,
}) => {
  const isNew = animKey === null;
  const [nameDraft, setNameDraft] = useState(name || '');
  const [renaming, setRenaming] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const title = isNew ? 'New image' : name || 'Image';

  const commitRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed === name) {
      setRenaming(false);
      setNameError(null);
      return;
    }
    const error = onRename(trimmed);
    setNameError(error);
    if (!error) {
      setRenaming(false);
    }
  };

  const startCreatePaint = () => {
    setNameError(onCreateFromPaint(nameDraft.trim()));
  };

  return (
    // data-theme flips the design system's semantic colors to dark inside
    // the panel (the TextField reads them).
    <div className={moduleStyles.dialogHost} data-theme="dark">
      <CustomDialog
        aria-label={title}
        onClose={onClose}
        mode="dark"
        className={moduleStyles.dialog}
      >
        <span id="dsco-dialog-description" className={moduleStyles.srOnly}>
          {isNew
            ? 'Name the image, then paint or generate it.'
            : 'View, edit, rename, or delete this image.'}
        </span>
        {/* Tabbable so the focus trap lands on the title first (the
            pixel editor's pattern). */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div className={moduleStyles.header} tabIndex={0}>
          {title}
        </div>
        <div className={moduleStyles.body}>
          <div className={moduleStyles.imagePane}>
            {thumb ? (
              <img src={thumb} alt={name || 'image'} />
            ) : (
              <div className={moduleStyles.imagePlaceholder} aria-hidden />
            )}
          </div>
          <div className={moduleStyles.detailsPane}>
            {isNew || renaming ? (
              <div className={moduleStyles.nameRow}>
                <TextField
                  name="imageName"
                  label="Name"
                  value={nameDraft}
                  errorMessage={nameError || undefined}
                  onChange={e => {
                    setNameDraft(e.target.value);
                    setNameError(null);
                  }}
                />
                {!isNew && (
                  <div className={moduleStyles.nameButtons}>
                    <button
                      type="button"
                      className={moduleStyles.primaryButton}
                      disabled={!nameDraft.trim()}
                      onClick={commitRename}
                    >
                      Save name
                    </button>
                    <button
                      type="button"
                      className={moduleStyles.button}
                      onClick={() => {
                        setNameDraft(name || '');
                        setNameError(null);
                        setRenaming(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={moduleStyles.nameRow}>
                <h2>{name}</h2>
                <button
                  type="button"
                  className={moduleStyles.button}
                  onClick={() => setRenaming(true)}
                >
                  Rename
                </button>
              </div>
            )}

            {generation && (
              <dl className={moduleStyles.metadata}>
                <dt>Prompt</dt>
                <dd>{generation.prompt}</dd>
                <dt>Type</dt>
                <dd>{TYPE_LABELS[generation.itemType]}</dd>
                <dt>Style</dt>
                <dd>{STYLE_LABELS[generation.style]}</dd>
                {generation.temperature !== undefined && (
                  <>
                    <dt>Wildness</dt>
                    <dd>{generation.temperature}</dd>
                  </>
                )}
              </dl>
            )}

            <div className={moduleStyles.actions}>
              {isNew ? (
                <button
                  type="button"
                  className={moduleStyles.primaryButton}
                  disabled={!nameDraft.trim()}
                  onClick={startCreatePaint}
                >
                  Paint it
                </button>
              ) : (
                <button
                  type="button"
                  className={moduleStyles.primaryButton}
                  onClick={onPaint}
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                className={moduleStyles.button}
                disabled
                title="AI generation moves here next"
              >
                Generate with AI
              </button>
            </div>

            {!isNew && (
              <div className={moduleStyles.dangerRow}>
                {confirmingDelete ? (
                  <>
                    <span>Delete this image?</span>
                    <button
                      type="button"
                      className={moduleStyles.dangerButton}
                      onClick={onDelete}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className={moduleStyles.button}
                      onClick={() => setConfirmingDelete(false)}
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={moduleStyles.dangerButton}
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CustomDialog>
    </div>
  );
};

export default ImageDetailsDialog;
