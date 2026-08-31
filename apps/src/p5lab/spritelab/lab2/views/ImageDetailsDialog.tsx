import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React, {useState} from 'react';

import {GeneratedImageResult} from '../ai/images/imageGeneration';
import {
  IMAGE_STYLE_LABELS,
  IMAGE_TYPE_LABELS,
  ImageGenerationMetadata,
  ImageType,
} from '../ai/images/types';
import {IMAGE_NAME_MAX_LENGTH, sanitizeImageName} from '../imageReferences';

import DeleteImageButton from './DeleteImageButton';
import GenerateImageView, {NewImageDraft} from './GenerateImageView';

import moduleStyles from './image-details-dialog.module.scss';

interface ImageDetailsDialogProps {
  // null = the "new image" state: it opens straight into the generate view
  // and nothing is created until a generation succeeds.
  animKey: string | null;
  name?: string;
  thumb?: string;
  generation?: ImageGenerationMetadata;
  onClose: () => void;
  /** Open the paint editor on this image. */
  onPaint: () => void;
  /** New image only: open the paint editor on a blank canvas. */
  onPaintNew?: (draft: NewImageDraft) => void;
  /** New image only: form values to reopen with after a cancelled paint. */
  newImageDraft?: NewImageDraft;
  /** Rename this image everywhere; error or null. */
  onRename: (newName: string) => string | null;
  onDelete: () => void;
  /** The image's kind; locked while regenerating an existing image. */
  imageType?: ImageType;
  /** Level-imposed type for new images. */
  lockedImageType?: ImageType;
  /** Current pixels, for generation's "use previous image". */
  getDataURI: () => Promise<string | null>;
  /** Whether another image already uses this name. */
  isNameTaken: (name: string) => boolean;
  /** Persist an accepted generation (newName set when creating). */
  onAcceptGenerated: (
    result: GeneratedImageResult,
    newName?: string
  ) => Promise<void>;
  /** This dialog session's recent generations; shown when there's a choice. */
  alternatives?: AlternativeImage[];
  /** Make this alternative the image. */
  onSelectAlternative?: (id: string) => void;
}

/** One choice in the Alternatives strip. */
export interface AlternativeImage {
  id: string;
  thumb: string;
  selected: boolean;
}

/**
 * The image dialog. An existing image opens on the summary view: the image
 * large on the left (click it to paint), how it was made on the right, and
 * delete/regenerate in the footer; its name sits in the header with a
 * pencil to rename. A new image opens straight into the generate view.
 * Wears the pixel editor's chrome, following the page's light/dark theme.
 */
const ImageDetailsDialog: React.FunctionComponent<ImageDetailsDialogProps> = ({
  animKey,
  name,
  thumb,
  generation,
  onClose,
  onPaint,
  onPaintNew,
  newImageDraft,
  onRename,
  onDelete,
  imageType,
  lockedImageType,
  getDataURI,
  isNameTaken,
  onAcceptGenerated,
  alternatives,
  onSelectAlternative,
}) => {
  const isNew = animKey === null;
  const {theme} = useTheme();
  const mode = theme === 'Dark' ? 'dark' : 'light';
  const [view, setView] = useState<'details' | 'generate'>(
    isNew ? 'generate' : 'details'
  );
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  // Flag a duplicate as it's typed and hold Save until it's unique (an
  // image keeps its own name while renaming).
  const draftName = nameDraft.trim();
  const duplicateName =
    !!draftName && draftName !== name && isNameTaken(draftName);
  const draftUsable = !!draftName && !duplicateName;
  const shownNameError = duplicateName
    ? 'That name is already used.'
    : nameError;

  const title = isNew ? 'New image' : name || 'Image';

  const commitRename = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === name) {
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

  const cancelRename = () => {
    setRenaming(false);
    setNameError(null);
  };

  return (
    // data-theme drives both the chrome's own colors and the design
    // system's semantic colors inside the panel (the TextField reads them).
    <div className={moduleStyles.dialogHost} data-theme={mode}>
      <CustomDialog
        aria-label={title}
        onClose={onClose}
        mode={mode}
        className={moduleStyles.dialog}
      >
        <span id="dsco-dialog-description" className={moduleStyles.srOnly}>
          {view === 'generate'
            ? 'Describe the image and generate it with AI.'
            : 'View, edit, rename, or delete this image.'}
        </span>
        <div className={moduleStyles.header}>
          {renaming ? (
            <>
              <TextField
                name="imageName"
                aria-label="Image name"
                className={moduleStyles.headerNameField}
                value={nameDraft}
                aria-invalid={!!shownNameError || undefined}
                aria-describedby={
                  shownNameError ? 'rename-image-error' : undefined
                }
                maxLength={IMAGE_NAME_MAX_LENGTH}
                onChange={e => {
                  setNameDraft(sanitizeImageName(e.target.value));
                  setNameError(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && draftUsable) {
                    commitRename();
                  } else if (e.key === 'Escape') {
                    // Stop it here or the whole dialog closes.
                    e.stopPropagation();
                    cancelRename();
                  }
                }}
              />
              <button
                type="button"
                className={moduleStyles.iconButton}
                aria-label="Save name"
                disabled={!draftUsable}
                onClick={commitRename}
              >
                <FontAwesomeV6Icon iconName="check" />
              </button>
              <button
                type="button"
                className={moduleStyles.iconButton}
                aria-label="Cancel rename"
                onClick={cancelRename}
              >
                <FontAwesomeV6Icon iconName="xmark" />
              </button>
              {/* Beside the field: below it would change the header's height
                  for the moment it shows. */}
              {shownNameError && (
                <span
                  id="rename-image-error"
                  role="status"
                  className={moduleStyles.inlineFieldError}
                >
                  {shownNameError}
                </span>
              )}
            </>
          ) : (
            <>
              {/* Tabbable so the focus trap lands on the title first (the
                  pixel editor's pattern). */}
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
              <span className={moduleStyles.headerTitle} tabIndex={0}>
                {title}
              </span>
              {!isNew && view === 'details' && (
                <button
                  type="button"
                  className={moduleStyles.iconButton}
                  aria-label="Rename"
                  onClick={() => {
                    setNameDraft(name || '');
                    setNameError(null);
                    setRenaming(true);
                  }}
                >
                  <FontAwesomeV6Icon iconName="pencil" />
                </button>
              )}
            </>
          )}
        </div>
        {view === 'generate' ? (
          <GenerateImageView
            existing={
              isNew
                ? undefined
                : {
                    generation,
                    imageType: imageType || 'sprite',
                    getDataURI,
                  }
            }
            thumb={isNew ? undefined : thumb}
            create={isNew ? {isNameTaken, initial: newImageDraft} : undefined}
            lockedImageType={lockedImageType}
            onPaintManually={isNew ? onPaintNew : undefined}
            onAccept={async (result, newName) => {
              await onAcceptGenerated(result, newName);
              setView('details');
            }}
            // A brand-new image has no summary to fall back to.
            onCancel={isNew ? onClose : () => setView('details')}
            onDelete={isNew ? undefined : onDelete}
          />
        ) : (
          <>
            <div className={moduleStyles.body}>
              <button
                type="button"
                className={classNames(
                  moduleStyles.imagePane,
                  moduleStyles.imageButton,
                  thumb && moduleStyles.imagePaneChecker
                )}
                aria-label="Edit with paint tools"
                onClick={onPaint}
              >
                {thumb ? (
                  <img src={thumb} alt="" />
                ) : (
                  <div className={moduleStyles.imagePlaceholder} aria-hidden />
                )}
                <span className={moduleStyles.paintOverlay} aria-hidden>
                  <FontAwesomeV6Icon iconName="pen" />
                </span>
              </button>
              <div className={moduleStyles.detailsPane}>
                {generation && (
                  <dl className={moduleStyles.metadata}>
                    <dt>Prompt</dt>
                    {/* Italic: the one field here the user wrote themselves. */}
                    <dd className={moduleStyles.promptValue}>
                      {generation.prompt}
                    </dd>
                    <dt>Type</dt>
                    <dd>{IMAGE_TYPE_LABELS[generation.imageType]}</dd>
                    <dt>Style</dt>
                    <dd>{IMAGE_STYLE_LABELS[generation.style]}</dd>
                    {generation.temperature !== undefined && (
                      <>
                        <dt>Temperature</dt>
                        <dd>{generation.temperature}</dd>
                      </>
                    )}
                  </dl>
                )}
                {alternatives && alternatives.length > 1 && (
                  <div className={moduleStyles.alternatives}>
                    <div className={moduleStyles.alternativesLabel}>
                      Alternatives
                    </div>
                    <div className={moduleStyles.alternativesRow}>
                      {alternatives.map(alt => (
                        <button
                          key={alt.id}
                          type="button"
                          className={classNames(
                            moduleStyles.alternativeThumb,
                            alt.selected && moduleStyles.alternativeSelected
                          )}
                          aria-label="Use this image"
                          aria-pressed={alt.selected}
                          onClick={() => onSelectAlternative?.(alt.id)}
                        >
                          <img src={alt.thumb} alt="" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={moduleStyles.footer}>
              <div className={moduleStyles.footerLeft}>
                <DeleteImageButton onDelete={onDelete} />
              </div>
              <button
                type="button"
                className={moduleStyles.button}
                onClick={() => setView('generate')}
              >
                <FontAwesomeV6Icon iconName="sparkles" />
                Generate with AI
              </button>
              <button
                type="button"
                className={moduleStyles.primaryButton}
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </>
        )}
      </CustomDialog>
    </div>
  );
};

export default ImageDetailsDialog;
