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
// The last tile is how you get more: the stock library, the same `(import…)` the
// blocks offer. A picture is a file in the project (appearance/importStock) and
// nothing here can draw one that is not — so the way to more of them belongs
// where you notice you want one.

import {Button, Typography} from '@mui/material';
import {useMemo, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {SheetFile} from '../appearance/sheetFile';
import {translate} from '../effect/localization';

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
  onCancel: () => void;
}

/** How wide a tile is drawn, in pixels. Tall art is fitted inside it. */
const TILE = 56;

export const SpritePickerDialog = ({
  sprites,
  images,
  sheets,
  current,
  onPick,
  onImport,
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
          label: translate('{sprite}, cell {n}', {
            sprite,
            n: String(index + 1),
          }),
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

  return (
    <Dialog
      role="dialog"
      title={translate('Choose a picture')}
      description={translate('Everything we can draw!')}
      onClose={onCancel}
      closeLabel={translate('Close')}
      primaryButtonProps={{
        children: translate('Use this picture'),
        disabled: !picked,
        onClick: () => picked && onPick(chose(picked)),
      }}
      secondaryButtonProps={{
        children: translate('Cancel'),
        onClick: onCancel,
      }}
      customContent={
        <div className={styles.body}>
          {tiles.length === 0 ? (
            <Typography variant="body2">
              {translate('This project has no pictures yet.')}
            </Typography>
          ) : (
            <ul className={styles.palette}>
              {tiles.map(tile => (
                <li key={tile.key}>
                  <button
                    type="button"
                    className={
                      tile.key === chosen
                        ? `${styles.tile} ${styles.tileChosen}`
                        : styles.tile
                    }
                    aria-pressed={tile.key === chosen}
                    aria-label={tile.label}
                    title={tile.label}
                    onClick={() => setChosen(tile.key)}
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
          )}
          <Button
            variant="text"
            size="small"
            startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
            onClick={onImport}
          >
            {translate('Import a picture')}
          </Button>
        </div>
      }
    />
  );
};
