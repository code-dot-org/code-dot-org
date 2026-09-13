// Choosing what to draw — by looking at it.
//
// One palette of everything the project can draw: its pictures, and its
// spritesheets taken apart into their cells. Not a list of file names, which is
// the one thing a name is bad at ("coinSpin.png" and "coin.png" are a letter
// apart and nothing alike), and not two questions — a picture, then which cell
// of it — when the learner is looking for one drawing and knows it on sight.
//
// So the tiles carry no text. The names are still there for a screen reader,
// and in a tooltip, because "which one was that" is a fair question to ask of a
// palette; they are simply not what the eye has to read to choose.
//
// The FIRST tiles are how you get more: the stock library, a blank one to draw
// on, a file off your own machine. A picture is a file in the project
// (appearance/importStock) and nothing here can draw one that is not — so the
// ways to more of them belong where you notice you want one, which is while you
// are looking at the ones you have.
//
// IT ANSWERS TWO QUESTIONS. "Which drawing shall this frame use", where a press
// selects and the button confirms — a click that changed the drawing under you
// would make browsing them costly — and "which picture shall I open", where the
// press is the whole act. `chooseOnPress` is which.
//
// …AND THERE IS A FOURTH WAY TO MORE OF THEM, which is to describe one and
// have it drawn. A tile like the other three, opening a view of its own: a
// prompt and a picture big enough to judge do not fit under a palette
// (`appearance/generate/DescribePicture`). Offered only where something can
// draw and the caller can write what comes back, so a lab with neither looks
// like a lab without the feature.
//
// THE CONFIRM KEEPS IT, whichever question this is answering. Choosing a
// picture off the palette costs one press, so a drawn one wanting a second —
// under a button beside the one you were going to press anyway — is a picture
// that gets left behind, which is exactly how it was reported one dialog over.
// So `Done` keeps it and closes, and `Use this picture` keeps it and uses it.

import {Typography} from '@mui/material';
import {useMemo, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {DescribePicture} from '../appearance/generate/DescribePicture';
import type {
  GeneratedPicture,
  ImageGenerator,
} from '../appearance/generate/imageGenerator';
import type {SheetFile} from '../appearance/sheetFile';

import {CellThumb} from './CellThumb';
import {sheetCells, type CellRect} from './sheetFrames';
import styles from './spritePickerDialog.module.css';

/** What was chosen: an image, and which cell of it when it is a sheet. */
export interface PickedSprite {
  sprite: string;
  /** The cell's index in reading order; absent for a whole picture. */
  cell?: number;
  /** The rectangle that index means, for a caller that stores rectangles. */
  rect?: CellRect;
}

/** One tile of the palette. */
interface Tile extends PickedSprite {
  /** What identifies it among the tiles, and what a screen reader hears. */
  key: string;
  label: string;
  image: HTMLImageElement;
  /** The part of the image the tile shows: a cell, or all of it. */
  area: CellRect;
}

export interface SpritePickerDialogProps {
  /** What the dialog is called, when it is not choosing a drawing. */
  title?: string;
  description?: string;
  /** The project's image file names, in the order to offer them. */
  sprites: readonly string[];
  /** Those images, decoded — the editor already holds them for its canvases. */
  images: Record<string, HTMLImageElement>;
  /** Which are grids: a sheet is offered as its cells, not as a wide picture. */
  sheets: Record<string, SheetFile>;
  /** What is drawn now, so the palette can show which tile that is. */
  current?: PickedSprite;
  onPick: (picked: PickedSprite) => void;
  /** Go to the stock library instead — this dialog closes as that one opens. */
  onImport: () => void;
  /** Make a blank one to draw on. Absent leaves the tile out. */
  onNew?: () => void;
  /** Take one off this machine. Absent leaves the tile out. */
  onUpload?: () => void;
  /**
   * Whether a press CHOOSES rather than selects.
   *
   * The palette picks a drawing for something being edited, so it selects and
   * confirms. The file menus pick a picture to OPEN, and there the press is the
   * whole act — the same reading the actors' grid has
   * (`actors/ActorPickerDialog`).
   */
  chooseOnPress?: boolean;
  /**
   * Where a described picture comes from, if anywhere.
   *
   * Absent leaves the tile out rather than offering one that fails
   * (`appearance/generate/imageGenerator`).
   */
  drawing?: ImageGenerator;
  /** Keep a drawn one — write it, and answer with its file name. */
  onKeep?: (picture: GeneratedPicture) => Promise<string | undefined>;
  onCancel: () => void;
}

/** How wide a tile is drawn, in pixels. Tall art is fitted inside it. */
const TILE = 56;

export const SpritePickerDialog = ({
  title = 'Choose a picture',
  description = 'Everything we can draw!',
  sprites,
  images,
  sheets,
  current,
  onPick,
  onImport,
  onNew,
  onUpload,
  chooseOnPress = false,
  drawing,
  onKeep,
  onCancel,
}: SpritePickerDialogProps) => {
  const tiles = useMemo((): Tile[] => {
    const out: Tile[] = [];
    for (const sprite of sprites) {
      const image = images[sprite];
      if (!image) {
        continue; // not decoded yet: it appears when it arrives
      }
      const cells = sheetCells(image, sheets[sprite]);
      if (cells.length <= 1) {
        out.push({
          key: sprite,
          label: sprite,
          sprite,
          image,
          area: {x: 0, y: 0, width: image.width, height: image.height},
        });
        continue;
      }
      cells.forEach((rect, index) => {
        out.push({
          key: `${sprite}#${index}`,
          // An `aria-label`/`title`, so it is a string rather than markup:
          // the sprite's file name cannot be fenced off the way it would be in
          // a sentence made of nodes.
          label: `${sprite}, cell ${index + 1}`,
          sprite,
          cell: index,
          rect,
          image,
          area: rect,
        });
      });
    }
    return out;
  }, [sprites, images, sheets]);

  /** What a tile means, without the parts that were only for drawing it. */
  const chose = (tile: Tile): PickedSprite => ({
    sprite: tile.sprite,
    cell: tile.cell,
    rect: tile.rect,
  });

  const keyOf = (picked: PickedSprite | undefined) =>
    picked === undefined
      ? ''
      : picked.cell === undefined
        ? picked.sprite
        : `${picked.sprite}#${picked.cell}`;

  // Selecting then confirming, like the lab's other pickers: a click that
  // changed the drawing under you would make browsing them costly.
  const [chosen, setChosen] = useState(keyOf(current));
  const picked = tiles.find(tile => tile.key === chosen);

  /** Whether the palette has been given over to describing one. */
  const [describing, setDescribing] = useState(false);
  /** A picture drawn and not yet written, which the confirm writes. */
  const [pending, setPending] = useState<GeneratedPicture>();
  const [busy, setBusy] = useState(false);

  /**
   * Write what is drawn, before the confirm does its own job.
   *
   * Answers what landed, or nothing when the write refused — which is the one
   * case a caller must not walk past: the panel has said why by then, and
   * carrying on would lose the picture the learner was looking at.
   */
  const keepDrawn = async (
    picture: GeneratedPicture,
  ): Promise<string | undefined> => {
    setBusy(true);
    const file = await onKeep?.(picture);
    setBusy(false);
    if (!file) {
      return undefined;
    }
    setPending(undefined);
    setDescribing(false);
    return file;
  };

  /**
   * Done: keep what is drawn, and close.
   *
   * NOTHING DRAWN IS NOTHING TO WAIT FOR, which is why the pending check comes
   * first rather than inside the write: an async function runs to its first
   * `await`, so a press with no picture still closes in the same tick it
   * always closed in.
   */
  const done = async () => {
    if (busy) {
      return;
    }
    if (pending && !(await keepDrawn(pending))) {
      return;
    }
    onCancel();
  };

  /**
   * Use this picture: keep what is drawn and use THAT, or the one already
   * selected when nothing was drawn.
   */
  const use = async () => {
    if (busy) {
      return;
    }
    if (!pending) {
      if (picked) {
        onPick(chose(picked));
      }
      return;
    }
    const file = await keepDrawn(pending);
    if (file) {
      onPick({sprite: file});
    }
  };

  /** One of the ways to get another picture, drawn as a tile of the grid. */
  const action = (
    key: string,
    icon: string,
    label: string,
    onClick: () => void,
  ) => (
    <li key={key}>
      <button
        type="button"
        className={`${styles.tile} ${styles.action}`}
        aria-label={label}
        title={label}
        onClick={onClick}
      >
        <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
        <Typography variant="body4">{label}</Typography>
      </button>
    </li>
  );

  return (
    <Dialog
      role="dialog"
      title={title}
      description={description}
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={
        chooseOnPress
          ? {
              children: busy ? 'Keeping the picture…' : 'Done',
              disabled: busy,
              onClick: () => void done(),
            }
          : {
              children: busy ? 'Keeping the picture…' : 'Use this picture',
              // A drawn picture is as good an answer as a selected one, and
              // before it is kept it is the only one this dialog has.
              disabled: busy || (!picked && !pending),
              onClick: () => void use(),
            }
      }
      secondaryButtonProps={
        chooseOnPress ? undefined : {children: 'Cancel', onClick: onCancel}
      }
      customContent={
        <div className={styles.body}>
          {describing && onKeep ? (
            <DescribePicture
              drawing={drawing}
              kind="actor"
              onDrew={setPending}
              onBack={() => {
                // Back to the palette is a rejection of the drawn one, so the
                // confirm must not then keep it.
                setPending(undefined);
                setDescribing(false);
              }}
              onKeep={onKeep}
              // …and it comes back to the palette selected, where the picture
              // it just became one of is under the cursor the learner left.
              onKept={file => {
                setChosen(file);
                setPending(undefined);
                setDescribing(false);
              }}
            />
          ) : (
            <>
              <ul className={styles.palette}>
                {action('import', 'download', 'Import', onImport)}
                {onNew && action('new', 'plus', 'New', onNew)}
                {onUpload && action('upload', 'upload', 'Upload', onUpload)}
                {drawing &&
                  onKeep &&
                  action('draw', 'wand-magic-sparkles', 'Describe', () =>
                    setDescribing(true),
                  )}
                {tiles.map(tile => (
                  <li key={tile.key}>
                    <button
                      type="button"
                      className={
                        tile.key === chosen
                          ? `${styles.tile} ${styles.tileChosen}`
                          : styles.tile
                      }
                      aria-pressed={
                        chooseOnPress ? undefined : tile.key === chosen
                      }
                      aria-label={tile.label}
                      title={tile.label}
                      onClick={() =>
                        chooseOnPress
                          ? onPick(chose(tile))
                          : setChosen(tile.key)
                      }
                      onDoubleClick={() => onPick(chose(tile))}
                    >
                      <CellThumb
                        image={tile.image}
                        cell={tile.area}
                        scale={
                          TILE / Math.max(tile.area.width, tile.area.height, 1)
                        }
                      />
                    </button>
                  </li>
                ))}
              </ul>
              {tiles.length === 0 && (
                <Typography variant="body2">
                  This project has no pictures yet.
                </Typography>
              )}
            </>
          )}
        </div>
      }
    />
  );
};
