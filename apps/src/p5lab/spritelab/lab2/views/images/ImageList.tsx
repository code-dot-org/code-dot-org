// The tab's left column: every image of the project as a tile, the one
// being worked on marked, plus the button that adds an image and the button
// that deletes the chosen one.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {
  imageKindNoun,
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

import {ProjectImage} from './projectImages';

import styles from './images-tab.module.scss';

/** A new image's kind, picked from the plus button's menu. */
export interface NewImageKind {
  imageType: ImageType;
  subject?: ImageSubject;
}

/** Two kinds match when they would make the same kind of image: the subject
    matters only for sprites, and a sprite with no subject is a character. */
const sameKind = (a: NewImageKind, b: NewImageKind) =>
  a.imageType === b.imageType &&
  (a.imageType !== 'sprite' ||
    (a.subject ?? 'character') === (b.subject ?? 'character'));

// Space kept above or below a slot scrolled into view, so its chosen ring,
// drawn outside the tile, is not clipped.
const SLOT_SCROLL_MARGIN = 8;

/** The kinds the plus offers, in the menu's order. */
const NEW_KINDS: {label: string; iconName: string; kind: NewImageKind}[] = [
  {
    label: 'Character',
    iconName: 'face-smile',
    kind: {imageType: 'sprite', subject: 'character'},
  },
  {label: 'Background', iconName: 'image', kind: {imageType: 'background'}},
  {
    label: 'Object',
    iconName: 'key',
    kind: {imageType: 'sprite', subject: 'object'},
  },
  {label: 'Block', iconName: 'cube', kind: {imageType: 'block'}},
];

/** The list's kinds, in the order they are listed: the plus menu's order. */
type KindId = 'character' | 'object' | 'background' | 'block';
const KINDS: {id: KindId; title: string}[] = [
  {id: 'character', title: 'Characters'},
  {id: 'background', title: 'Backgrounds'},
  {id: 'object', title: 'Objects'},
  {id: 'block', title: 'Blocks'},
];
const kindOf = (imageType: ImageType, subject?: ImageSubject): KindId =>
  imageType === 'sprite'
    ? subject === 'object'
      ? 'object'
      : 'character'
    : imageType;

/** An image not made yet: its tile holds the place the finished image's
    tile will take. */
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
  /** Whether the choice may move to another image. A level about one image
      keeps it where it is: the other tiles are listed but disabled. */
  chooseOffered?: boolean;
  /** Called with the kind picked from the plus menu; absent when the level
      does not let students add images, and the plus is then hidden. */
  onNew?: (kind: NewImageKind) => void;
  /** The one kind the level lets students make; the menu disables every
      other kind. */
  newKind?: NewImageKind;
  /** Delete the chosen image; absent where images cannot be deleted. */
  onDelete?: (key: string) => void;
}

const ImageList: React.FunctionComponent<ImageListProps> = ({
  images,
  draft,
  chosenId,
  onChoose,
  chooseOffered = true,
  onNew,
  newKind,
  onDelete,
}) => {
  // The delete confirmation is open; changing the chosen image closes it.
  const [confirming, setConfirming] = useState(false);
  // ActionDropdown's option click closes the menu through a context that
  // CustomDropdown provides only inside itself, so a pick leaves the menu
  // open. Changing the key remounts it closed.
  const [menuKey, setMenuKey] = useState(0);
  useEffect(() => setConfirming(false), [chosenId]);
  // Scroll the tiles box so a new draft slot is fully visible, smoothly
  // unless the student asked for less motion. It runs one animation frame
  // after the draft mounts: a scroll in the same frame as the layout change
  // was undone by the layout. It keys on the draft object, which is new for
  // every draft although every draft has the same id, so each new slot
  // scrolls.
  const tilesRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!draft) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const tiles = tilesRef.current;
      const slot = draftRef.current;
      // clientHeight is 0 before layout.
      if (!tiles || !slot || !tiles.clientHeight) {
        return;
      }
      const box = tiles.getBoundingClientRect();
      const rect = slot.getBoundingClientRect();
      const top = tiles.scrollTop + rect.top - box.top - SLOT_SCROLL_MARGIN;
      const bottom =
        tiles.scrollTop + rect.bottom - box.top + SLOT_SCROLL_MARGIN;
      const target =
        top < tiles.scrollTop
          ? top
          : bottom > tiles.scrollTop + tiles.clientHeight
          ? bottom - tiles.clientHeight
          : null;
      if (target === null) {
        return;
      }
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      tiles.scrollTo({top: target, behavior: reduced ? 'auto' : 'smooth'});
    });
    return () => window.cancelAnimationFrame(frame);
  }, [draft]);
  const chosenImage = images.find(image => image.key === chosenId);
  const deletable = !!onDelete && !!chosenImage;
  return (
    <section className={styles.list} aria-label="Your images">
      <div className={styles.listHeader}>
        <div className={styles.listTitle}>
          <MuiTypography
            component="h3"
            variant="h6"
            className={styles.listName}
          >
            Your images
          </MuiTypography>
          <MuiTypography
            component="p"
            variant="body3"
            className={styles.listCount}
          >
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </MuiTypography>
        </div>
        {onNew && (
          <ActionDropdown
            key={menuKey}
            name="new-image"
            labelText="New image"
            size="m"
            menuPlacement="right"
            triggerButtonProps={{
              variant: 'contained',
              color: 'primary',
              className: styles.newButton,
              children: <FontAwesomeV6Icon iconName="plus" />,
            }}
            options={NEW_KINDS.map(({label, iconName, kind}) => ({
              value: label,
              label,
              icon: {iconName},
              isOptionDisabled: !!newKind && !sameKind(kind, newKind),
              onClick: () => {
                setMenuKey(k => k + 1);
                onNew(kind);
              },
            }))}
          />
        )}
      </div>
      <div ref={tilesRef} className={styles.tiles}>
        {KINDS.map(kind => {
          const kindImages = images.filter(
            image => kindOf(image.imageType, image.subject) === kind.id
          );
          const kindDraft =
            draft && kindOf(draft.imageType, draft.subject) === kind.id
              ? draft
              : null;
          if (!kindImages.length && !kindDraft) {
            return null;
          }
          return (
            <React.Fragment key={kind.id}>
              <MuiTypography
                component="h4"
                variant="overline2"
                className={styles.tilesHeader}
              >
                {kind.title}
              </MuiTypography>
              {/* The draft tile goes first because the project puts a new
                  image at the front of the list. */}
              {kindDraft && (
                <div
                  ref={draftRef}
                  className={classNames(
                    styles.tileSlot,
                    kindDraft.id === chosenId && styles.tileSlotChosen
                  )}
                >
                  <button
                    type="button"
                    className={classNames(styles.tile, styles.tileDraft)}
                    aria-pressed={kindDraft.id === chosenId}
                    aria-label={`New ${imageKindNoun(
                      kindDraft.imageType,
                      kindDraft.subject
                    )}`}
                    onClick={() => onChoose(kindDraft.id)}
                  />
                </div>
              )}
              {kindImages.map(image => {
                const chosen = image.key === chosenId;
                const choiceLocked = !chooseOffered && !chosen;
                return (
                  <div
                    key={image.key}
                    className={classNames(
                      styles.tileSlot,
                      chosen && styles.tileSlotChosen
                    )}
                  >
                    <button
                      type="button"
                      className={styles.tile}
                      aria-pressed={chosen}
                      aria-label={image.name}
                      disabled={choiceLocked}
                      onClick={() => onChoose(image.key)}
                    >
                      {image.thumb && (
                        <img
                          src={image.thumb}
                          alt=""
                          className={classNames(
                            image.pixelated && styles.pixelArt
                          )}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      {deletable && (
        <div className={styles.listFooter}>
          <MuiIconButton
            variant="text"
            color="tertiary"
            size="small"
            aria-label="Delete image"
            onClick={() => setConfirming(true)}
          >
            <FontAwesomeV6Icon iconName="trash-can" />
          </MuiIconButton>
        </div>
      )}
      {confirming && chosenImage && (
        <MuiDialog
          title="Delete this image?"
          customContent={
            <div className={styles.deleteLead}>
              {chosenImage.thumb && (
                <img
                  src={chosenImage.thumb}
                  alt={chosenImage.name}
                  className={classNames(
                    styles.deleteThumb,
                    chosenImage.pixelated && styles.pixelArt
                  )}
                />
              )}
              <p id="dsco-dialog-description" className={styles.deleteText}>
                It goes from your project, and from any scene using it.
              </p>
            </div>
          }
          onClose={() => setConfirming(false)}
          secondaryButtonProps={{
            children: 'Cancel',
            onClick: () => setConfirming(false),
          }}
          primaryButtonProps={{
            children: 'Delete',
            color: 'error',
            onClick: () => {
              setConfirming(false);
              onDelete?.(chosenImage.key);
            },
          }}
        />
      )}
    </section>
  );
};

export default ImageList;
