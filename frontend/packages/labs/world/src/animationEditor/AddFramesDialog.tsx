// Building frames out of a spritesheet, in one go.
//
// A walk cycle is four cells of one image in reading order, and making it a
// frame at a time — add frame, pick the sprite, pick the cell, four times over —
// is work a learner should never have been asked to do. A `.sheet` already says
// where the cells are (appearance/sheetFile); this asks which of them to play.
//
// Every cell is a button: it can be reached with the keyboard, it says whether
// it is in, and it says where in the animation it lands. Selection is by cell,
// but order is always reading order — a strip is drawn in the order it plays,
// and a picker that let the two disagree would be a puzzle rather than a tool.

import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import type {SheetFile} from '../appearance/sheetFile';
import {translate} from '../effect/localization';

import styles from './addFramesDialog.module.css';
import {CellThumb} from './CellThumb';
import cellStyles from './cellThumb.module.css';
import {type CellRect, sheetCells, sheetGrid} from './sheetFrames';

/** Cells are drawn at 2×, as everywhere else in this editor. */
const SCALE = 2;

export interface AddFramesDialogProps {
  /** The project's grids, by image file name. */
  sheets: Record<string, SheetFile>;
  /** Those images, decoded — the editor already holds them for its canvases. */
  images: Record<string, HTMLImageElement>;
  /** Add these cells of this image, in this order, as frames. */
  onAdd: (sprite: string, cells: CellRect[]) => void;
  onCancel: () => void;
}

export const AddFramesDialog = ({
  sheets,
  images,
  onAdd,
  onCancel,
}: AddFramesDialogProps) => {
  // Only sheets whose image has arrived: a cell of an image that has not
  // decoded is a rectangle nobody can see to choose.
  const names = useMemo(
    () => Object.keys(sheets).filter(name => images[name]),
    [sheets, images],
  );
  const [sprite, setSprite] = useState(names[0] ?? '');
  const image = images[sprite];
  const cells = useMemo(
    () => sheetCells(image, sheets[sprite]),
    [image, sheets, sprite],
  );
  const {columns} = sheetGrid(image, sheets[sprite]);

  // Every cell, to start with: taking the whole strip is what most sheets are
  // for, and unpicking two is less work than picking six.
  const [chosen, setChosen] = useState<ReadonlySet<number>>(new Set());
  useEffect(() => {
    setChosen(new Set(cells.map((_cell, index) => index)));
  }, [cells]);

  const toggle = (index: number): void =>
    setChosen(previous => {
      const next = new Set(previous);
      if (!next.delete(index)) {
        next.add(index);
      }
      return next;
    });

  // Reading order, whatever order they were clicked in.
  const order = [...chosen].sort((a, b) => a - b);

  return (
    <Dialog
      role="dialog"
      title={translate('Add frames from a spritesheet')}
      description={translate(
        'Each cell becomes a frame, in the order they are read: left to right, top to bottom.',
      )}
      onClose={onCancel}
      closeLabel={translate('Close')}
      primaryButtonProps={{
        children:
          order.length === 1
            ? translate('Add 1 frame')
            : translate('Add {count} frames', {count: String(order.length)}),
        disabled: order.length === 0,
        onClick: () =>
          onAdd(
            sprite,
            order.map(index => cells[index]),
          ),
      }}
      secondaryButtonProps={{
        children: translate('Cancel'),
        onClick: onCancel,
      }}
      customContent={
        names.length === 0 ? (
          <Typography variant="body2">
            {translate(
              'No spritesheets yet. A picture becomes one when it has a .sheet file beside it.',
            )}
          </Typography>
        ) : (
          <div className={styles.body}>
            {names.length > 1 && (
              <div className={styles.sheets}>
                {names.map(name => (
                  <Button
                    key={name}
                    className={styles.sheetButton}
                    variant={name === sprite ? 'contained' : 'outlined'}
                    color="secondary"
                    size="small"
                    aria-pressed={name === sprite}
                    onClick={() => setSprite(name)}
                  >
                    <img
                      className={styles.sheetPreview}
                      src={images[name].src}
                      alt=""
                      aria-hidden="true"
                    />
                    <Typography
                      component="span"
                      variant="body4"
                      color="inherit"
                    >
                      {name}
                    </Typography>
                  </Button>
                ))}
              </div>
            )}

            <div className={styles.actions}>
              <Button
                variant="text"
                size="extraSmall"
                onClick={() =>
                  setChosen(new Set(cells.map((_cell, index) => index)))
                }
              >
                {translate('Select all')}
              </Button>
              <Button
                variant="text"
                size="extraSmall"
                onClick={() => setChosen(new Set())}
              >
                {translate('Clear')}
              </Button>
            </div>

            <ul
              className={styles.grid}
              style={{
                gridTemplateColumns: `repeat(${Math.max(1, columns)}, max-content)`,
              }}
            >
              {cells.map((cell, index) => {
                const place = order.indexOf(index);
                return (
                  <li key={index}>
                    <button
                      type="button"
                      className={
                        place >= 0
                          ? `${cellStyles.cellButton} ${cellStyles.cellChosen}`
                          : cellStyles.cellButton
                      }
                      aria-pressed={place >= 0}
                      aria-label={
                        place >= 0
                          ? translate('Cell {n}, frame {place}', {
                              n: String(index + 1),
                              place: String(place + 1),
                            })
                          : translate('Cell {n}, not used', {
                              n: String(index + 1),
                            })
                      }
                      onClick={() => toggle(index)}
                    >
                      <CellThumb image={image} cell={cell} scale={SCALE} />
                      <span className={styles.place} aria-hidden="true">
                        {place >= 0 ? place + 1 : ''}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )
      }
    />
  );
};
