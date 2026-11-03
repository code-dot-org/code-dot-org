// The tab's left column: every image of the project as a tile, the one
// being worked on marked, with the way to add one and to delete one.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {imageKindLabel, ImageSubject, ImageType} from '../../ai/images/types';

import {ProjectImage} from './projectImages';

/** A new image's kind, chosen under the plus. */
export interface NewImageKind {
  imageType: ImageType;
  subject?: ImageSubject;
}

/** Two kinds are the same when their images would be. */
const sameKind = (a: NewImageKind, b: NewImageKind) =>
  a.imageType === b.imageType &&
  (a.imageType !== 'sprite' ||
    (a.subject ?? 'character') === (b.subject ?? 'character'));

// Room kept around a slot scrolled into view: its ring and its offset.
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
  /** The plus: a new image of the kind picked under it, offered where the
      level lets students add. */
  onNew?: (kind: NewImageKind) => void;
  /** The one kind the level lets students make; the menu's other kinds
      are shown but off, so the plus works as it does in free play. */
  newKind?: NewImageKind;
  /** Delete the chosen image; absent where images cannot be deleted. */
  onDelete?: (key: string) => void;
}

const ImageList: React.FunctionComponent<ImageListProps> = ({
  images,
  draft,
  chosenId,
  onChoose,
  onNew,
  newKind,
  onDelete,
}) => {
  // Delete asks once; a new choice withdraws the question.
  const [confirming, setConfirming] = useState(false);
  // The library's action dropdown closes through a context its own wrapper
  // does not share, so a pick would leave the menu open; a remount closes it.
  const [menuKey, setMenuKey] = useState(0);
  useEffect(() => setConfirming(false), [chosenId]);
  // A new slot may land below the fold of a long list: scroll the tiles
  // so the whole slot shows, ring and all, smoothly unless the student
  // asked for less motion. A frame after it mounts, so the list has
  // settled and nothing jumps the scroll back. Every draft is its own
  // object under one id, so the scroll follows each new slot, not only
  // the first after none.
  const tilesRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!draft) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const tiles = tilesRef.current;
      const slot = draftRef.current;
      // No box to scroll before layout, or where there is no layout.
      if (!tiles || !slot || !tiles.clientHeight || !tiles.scrollTo) {
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
      const reduced = window.matchMedia?.(
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
          const own = images.filter(
            image => kindOf(image.imageType, image.subject) === kind.id
          );
          const ownDraft =
            draft && kindOf(draft.imageType, draft.subject) === kind.id
              ? draft
              : null;
          if (!own.length && !ownDraft) {
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
              {/* First, where the finished image will land: the project
                  puts new images at the front. */}
              {ownDraft && (
                <div
                  ref={draftRef}
                  className={classNames(
                    styles.tileSlot,
                    ownDraft.id === chosenId && styles.tileSlotChosen
                  )}
                >
                  <button
                    type="button"
                    className={classNames(styles.tile, styles.tileDraft)}
                    aria-pressed={ownDraft.id === chosenId}
                    aria-label={`New ${imageKindLabel(
                      ownDraft.imageType,
                      ownDraft.subject
                    ).toLowerCase()}`}
                    onClick={() => onChoose(ownDraft.id)}
                  />
                </div>
              )}
              {own.map(image => {
                const chosen = image.key === chosenId;
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
                      aria-label={image.name || 'image'}
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
                  alt=""
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
