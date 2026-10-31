// The tab's left column: every image of the project as a tile, the one
// being worked on marked, with the way to add one and to delete one.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {imageKindLabel, ImageSubject, ImageType} from '../../ai/images/types';

import {ProjectImage} from './projectImages';

import styles from './images-tab.module.scss';

/** An image not made yet: its tile stands where the image will. */
export interface DraftEntry {
  id: string;
  imageType: ImageType;
  subject?: ImageSubject;
}

interface ImageListProps {
  images: ProjectImage[];
  draft: DraftEntry | null;
  /** The chosen image's key, or the draft's id. */
  chosenId: string | null;
  onChoose: (id: string) => void;
  /** The plus: a new image, offered where the level lets students add. */
  onNew?: () => void;
  /** Delete the chosen image; absent where images cannot be deleted. */
  onDelete?: (key: string) => void;
}

const ImageList: React.FunctionComponent<ImageListProps> = ({
  images,
  draft,
  chosenId,
  onChoose,
  onNew,
  onDelete,
}) => {
  // Delete asks once; a new choice withdraws the question.
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setConfirming(false), [chosenId]);
  const chosenImage = images.find(image => image.key === chosenId);
  const deletable = !!onDelete && !!chosenImage;
  return (
    <section className={styles.list} aria-label="Your images">
      <div className={styles.listHeader}>
        {confirming && chosenImage ? (
          <>
            <span className={styles.listQuestion}>Delete this image?</span>
            <MuiButton
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </MuiButton>
            <MuiButton
              variant="contained"
              color="error"
              size="small"
              onClick={() => {
                setConfirming(false);
                onDelete?.(chosenImage.key);
              }}
            >
              Delete
            </MuiButton>
          </>
        ) : (
          <>
            <MuiTypography
              component="h3"
              variant="overline2"
              className={styles.listTitle}
            >
              Your images
            </MuiTypography>
            {deletable && (
              <MuiIconButton
                variant="text"
                color="tertiary"
                size="small"
                aria-label="Delete image"
                onClick={() => setConfirming(true)}
              >
                <FontAwesomeV6Icon iconName="trash-can" />
              </MuiIconButton>
            )}
            {onNew && (
              <MuiIconButton
                variant="text"
                color="tertiary"
                size="small"
                aria-label="New image"
                onClick={onNew}
              >
                <FontAwesomeV6Icon iconName="plus" />
              </MuiIconButton>
            )}
          </>
        )}
      </div>
      <div className={styles.tiles}>
        {images.map(image => {
          const chosen = image.key === chosenId;
          return (
            <button
              key={image.key}
              type="button"
              className={classNames(styles.tile, chosen && styles.tileChosen)}
              aria-pressed={chosen}
              aria-label={image.name || 'image'}
              onClick={() => onChoose(image.key)}
            >
              {image.thumb && (
                <img
                  src={image.thumb}
                  alt=""
                  className={classNames(image.pixelated && styles.pixelArt)}
                />
              )}
            </button>
          );
        })}
        {draft && (
          <button
            type="button"
            className={classNames(
              styles.tile,
              styles.tileDraft,
              draft.id === chosenId && styles.tileChosen
            )}
            aria-pressed={draft.id === chosenId}
            aria-label={`New ${imageKindLabel(
              draft.imageType,
              draft.subject
            ).toLowerCase()}`}
            onClick={() => onChoose(draft.id)}
          >
            <FontAwesomeV6Icon iconName="plus" aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
};

export default ImageList;
