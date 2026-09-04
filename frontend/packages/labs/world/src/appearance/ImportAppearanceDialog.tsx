// The picker behind a sprite or animation dropdown's `(import…)` row.
//
// The same dialog for both libraries, because they are the same act — copy a
// drawing into the project — and differ only in what is drawn and what the block
// ends up naming. The image is the description here: a list of names would tell
// a learner nothing about a picture.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import {AnimationPreview} from './AnimationPreview';
import type {AppearanceKind} from './appearanceImport';
import styles from './importAppearanceDialog.module.css';
import {sheetFileName} from './sheetFile';
import {
  pictureSprites,
  STOCK_SPRITES,
  spriteFileName,
  stockSprite,
  STOCK_ANIMATIONS,
  type StockAnimation,
  type StockSprite,
} from './stock';

export interface ImportAppearanceDialogProps {
  /** Which library to show. */
  kind: AppearanceKind;
  /** Chosen — copy it into the project. */
  onImport: (chosen: StockSprite | StockAnimation) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
  /**
   * Whether the picture is being chosen to cut FRAMES from.
   *
   * The one place a strip is the right answer. Giving an actor its picture and
   * giving an animation frame its source are the same dialog and opposite
   * questions: `coinSpin.png` as an actor's picture draws six coins at once,
   * and as a frame's source it is the whole point.
   */
  forFrames?: boolean;
}

/** The files one sprite lands as: the image, and the grid file if it is a grid. */
const spriteFiles = (sprite: StockSprite): string[] => {
  const image = spriteFileName(sprite.id);
  return sprite.sheet ? [image, sheetFileName(image)] : [image];
};

/**
 * Everything an import writes, in the order it writes it.
 *
 * The row promises this, so it is derived the same way `importStock` derives
 * what it writes — a promise of two files that leaves three behind is worse than
 * no promise.
 */
export const addedFiles = (item: StockSprite | StockAnimation): string[] =>
  'dataUrl' in item
    ? spriteFiles(item)
    : [
        `${item.id}.anim`,
        ...item.sprites.flatMap(id => {
          const sprite = stockSprite(id);
          return sprite ? spriteFiles(sprite) : [];
        }),
      ];

/** The image a sprite row shows, which is the sprite. */
const previewUrl = (item: StockSprite): string => item.dataUrl;

export const ImportAppearanceDialog = ({
  kind,
  onImport,
  onCancel,
  forFrames = false,
}: ImportAppearanceDialogProps) => {
  // Picking a row selects it; `Import` commits — the same deferred choice the
  // rule and effect pickers make, for the same reason.
  const [chosen, setChosen] = useState<StockSprite | StockAnimation | null>(
    null,
  );
  // PICTURES, not every image in the library: the strips an animation is made
  // of are offered by the animation picker, where they read as what they are.
  // Placing one as an actor's picture draws all six coins at once.
  //
  // UNLESS FRAMES ARE BEING CUT FROM IT, which is the animation editor asking,
  // and the one place a strip is the answer rather than the mistake.
  const items: ReadonlyArray<StockSprite | StockAnimation> =
    kind === 'sprite'
      ? forFrames
        ? STOCK_SPRITES
        : pictureSprites()
      : STOCK_ANIMATIONS;

  return (
    <Dialog
      // A picker, not an alert.
      role="dialog"
      title={kind === 'sprite' ? 'Add a picture' : 'Add an animation'}
      description={
        kind === 'sprite'
          ? 'Pick one to copy into your project. It becomes a file you can draw over.'
          : 'Pick one to copy into your project, with the picture it is made of.'
      }
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Import',
        disabled: chosen === null,
        onClick: () => chosen && onImport(chosen),
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        onClick: onCancel,
      }}
      customContent={
        <ul className={styles.list}>
          {items.map(item => (
            <li key={item.id}>
              <Button
                className={styles.item}
                variant={chosen?.id === item.id ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                fullWidth
                aria-pressed={chosen?.id === item.id}
                onClick={() => setChosen(item)}
                onDoubleClick={() => onImport(item)}
              >
                {'dataUrl' in item ? (
                  <img
                    className={styles.preview}
                    src={previewUrl(item)}
                    alt=""
                    aria-hidden="true"
                  />
                ) : (
                  // An animation shows itself PLAYING — see `AnimationPreview`
                  // on why a strip is the wrong picture of one.
                  <AnimationPreview animation={item} />
                )}
                <span className={styles.text}>
                  <Typography component="span" variant="label2" color="inherit">
                    {item.name}
                  </Typography>
                  <Typography component="span" variant="body4" color="inherit">
                    {item.description}
                  </Typography>
                  <Typography component="span" variant="body4" color="inherit">
                    {/* The FILE NAMES this import writes — the project's, not
                        a phrase, so the page's translation leaves them be. */}
                    Adds:{' '}
                    <span data-notranslate>{addedFiles(item).join(', ')}</span>
                  </Typography>
                </span>
              </Button>
            </li>
          ))}
        </ul>
      }
    />
  );
};

export default ImportAppearanceDialog;
