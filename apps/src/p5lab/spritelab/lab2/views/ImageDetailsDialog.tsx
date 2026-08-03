import {CustomDialog} from '@code-dot-org/component-library/dialog';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React, {useState} from 'react';

import {ImageGenerationMetadata, SpriteLab2ItemType} from '../types';

import GenerateImageView, {GeneratedImageResult} from './GenerateImageView';

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
  /** The image's kind; locked while regenerating an existing image. */
  itemType?: SpriteLab2ItemType;
  /** Current pixels, for generation's "use previous image". */
  getDataURI: () => Promise<string | null>;
  /** Validate a new image's name before generating; error or null. */
  onValidateNewName: (name: string) => string | null;
  /** Persist an accepted generation (newName set when creating). */
  onAcceptGenerated: (
    result: GeneratedImageResult,
    newName?: string
  ) => Promise<void>;
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
  itemType,
  getDataURI,
  onValidateNewName,
  onAcceptGenerated,
}) => {
  const isNew = animKey === null;
  const [nameDraft, setNameDraft] = useState(name || '');
  const [renaming, setRenaming] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [view, setView] = useState<'details' | 'generate'>('details');

  const title =
    view === 'generate'
      ? `Generate: ${isNew ? nameDraft.trim() || 'new image' : name}`
      : isNew
      ? 'New image'
      : name || 'Image';

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
        className={classNames(
          moduleStyles.dialog,
          view === 'generate' && moduleStyles.dialogWide
        )}
      >
        <span id="dsco-dialog-description" className={moduleStyles.srOnly}>
          {view === 'generate'
            ? 'Describe the image and generate it with AI.'
            : isNew
            ? 'Name the image, then paint or generate it.'
            : 'View, edit, rename, or delete this image.'}
        </span>
        {/* Tabbable so the focus trap lands on the title first (the
            pixel editor's pattern). */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div className={moduleStyles.header} tabIndex={0}>
          {title}
        </div>
        {view === 'generate' ? (
          <GenerateImageView
            existing={
              isNew
                ? undefined
                : {
                    generation,
                    itemType: itemType || 'sprite',
                    getDataURI,
                  }
            }
            onAccept={async result => {
              await onAcceptGenerated(
                result,
                isNew ? nameDraft.trim() : undefined
              );
              setView('details');
            }}
            onBack={() => setView('details')}
          />
        ) : (
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
                {isNew ? (
                  <button
                    type="button"
                    className={moduleStyles.button}
                    disabled={!nameDraft.trim()}
                    onClick={() => {
                      const error = onValidateNewName(nameDraft.trim());
                      setNameError(error);
                      if (!error) {
                        setView('generate');
                      }
                    }}
                  >
                    Generate it
                  </button>
                ) : (
                  <button
                    type="button"
                    className={moduleStyles.button}
                    onClick={() => setView('generate')}
                  >
                    Generate with AI
                  </button>
                )}
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
        )}
      </CustomDialog>
    </div>
  );
};

export default ImageDetailsDialog;
