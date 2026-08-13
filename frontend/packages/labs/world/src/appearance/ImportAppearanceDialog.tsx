// The picker behind a sprite or animation dropdown's `(import…)` row.
//
// The same dialog for both libraries, because they are the same act — copy a
// drawing into the project — and differ only in what is drawn and what the block
// ends up naming. The image is the description here: a list of names would tell
// a learner nothing about a picture.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import {translate} from '../effect/localization';

import type {AppearanceKind} from './appearanceImport';
import styles from './importAppearanceDialog.module.css';
import {sheetFileName} from './sheetFile';
import {
  spriteFileName,
  stockSprite,
  STOCK_ANIMATIONS,
  STOCK_SPRITES,
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

/** The image a row shows: the sprite itself, or the first sprite an animation reads. */
const previewUrl = (item: StockSprite | StockAnimation): string | undefined =>
  'dataUrl' in item
    ? item.dataUrl
    : stockSprite(item.sprites[0] ?? '')?.dataUrl;

export const ImportAppearanceDialog = ({
  kind,
  onImport,
  onCancel,
}: ImportAppearanceDialogProps) => {
  // Picking a row selects it; `Import` commits — the same deferred choice the
  // rule and effect pickers make, for the same reason.
  const [chosen, setChosen] = useState<StockSprite | StockAnimation | null>(
    null,
  );
  const items: ReadonlyArray<StockSprite | StockAnimation> =
    kind === 'sprite' ? STOCK_SPRITES : STOCK_ANIMATIONS;

  return (
    <Dialog
      // A picker, not an alert.
      role="dialog"
      title={
        kind === 'sprite'
          ? translate('Add a picture')
          : translate('Add an animation')
      }
      description={
        kind === 'sprite'
          ? translate(
              'Pick one to copy into your project. It becomes a file you can draw over.',
            )
          : translate(
              'Pick one to copy into your project, with the picture it is made of.',
            )
      }
      onClose={onCancel}
      closeLabel={translate('Close')}
      primaryButtonProps={{
        children: translate('Import'),
        disabled: chosen === null,
        onClick: () => chosen && onImport(chosen),
      }}
      secondaryButtonProps={{
        children: translate('Cancel'),
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
                <img
                  className={styles.preview}
                  src={previewUrl(item)}
                  alt=""
                  aria-hidden="true"
                />
                <span className={styles.text}>
                  <Typography component="span" variant="label2" color="inherit">
                    {item.name}
                  </Typography>
                  <Typography component="span" variant="body4" color="inherit">
                    {item.description}
                  </Typography>
                  <Typography component="span" variant="body4" color="inherit">
                    {translate('Adds: {names}', {
                      names: addedFiles(item).join(', '),
                    })}
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
