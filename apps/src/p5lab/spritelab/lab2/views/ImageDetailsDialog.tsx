import {CustomDialog} from '@code-dot-org/component-library/dialog';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
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
 * how it was made on the right, with edit, rename, and delete. AI generation
 * hands off to the generate view (next phase).
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
    <div className={moduleStyles.dialogHost}>
      <CustomDialog
        aria-label={isNew ? 'New image' : `Image: ${name}`}
        onClose={onClose}
        className={moduleStyles.dialog}
      >
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
                    <MuiButton
                      variant="contained"
                      size="small"
                      disabled={!nameDraft.trim()}
                      onClick={commitRename}
                    >
                      Save name
                    </MuiButton>
                    <MuiButton
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => {
                        setNameDraft(name || '');
                        setNameError(null);
                        setRenaming(false);
                      }}
                    >
                      Cancel
                    </MuiButton>
                  </div>
                )}
              </div>
            ) : (
              <div className={moduleStyles.nameRow}>
                <MuiTypography variant="h4" component="h2">
                  {name}
                </MuiTypography>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  onClick={() => setRenaming(true)}
                >
                  Rename
                </MuiButton>
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
                <MuiButton
                  variant="contained"
                  size="small"
                  disabled={!nameDraft.trim()}
                  onClick={startCreatePaint}
                >
                  Paint it
                </MuiButton>
              ) : (
                <MuiButton variant="contained" size="small" onClick={onPaint}>
                  Edit
                </MuiButton>
              )}
              <MuiButton
                variant="outlined"
                color="secondary"
                size="small"
                disabled
                title="AI generation moves here next"
              >
                Generate with AI
              </MuiButton>
            </div>

            {!isNew && (
              <div className={moduleStyles.dangerRow}>
                {confirmingDelete ? (
                  <>
                    <MuiTypography variant="body2" component="span">
                      Delete this image?
                    </MuiTypography>
                    <MuiButton
                      variant="contained"
                      color="error"
                      size="extraSmall"
                      onClick={onDelete}
                    >
                      Delete
                    </MuiButton>
                    <MuiButton
                      variant="outlined"
                      color="secondary"
                      size="extraSmall"
                      onClick={() => setConfirmingDelete(false)}
                    >
                      Keep
                    </MuiButton>
                  </>
                ) : (
                  <MuiButton
                    variant="outlined"
                    color="error"
                    size="extraSmall"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Delete
                  </MuiButton>
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
