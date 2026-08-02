// Choosing what a frame draws — by looking at it.
//
// A frame's picture was a dropdown of file names, which is the one thing a
// name is bad at: "coinSpin.png" and "coin.png" are a letter apart and nothing
// alike, and a learner who drew three of their own has three names they have to
// remember the difference between. So the pictures are the list.
//
// The last row is how you get more: the stock library, the same `(import…)` the
// blocks offer. A picture is a file in the project (appearance/importStock) and
// nothing here can draw one that is not — so the way to more of them belongs
// where you notice you want one.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {SheetFile} from '../appearance/sheetFile';
import {translate} from '../effect/localization';

import styles from './spritePickerDialog.module.css';

export interface SpritePickerDialogProps {
  /** The project's image file names, in the order to offer them. */
  sprites: readonly string[];
  /** Those images, decoded — the editor already holds them for its canvases. */
  images: Record<string, HTMLImageElement>;
  /** Which are grids, so a sheet can say so rather than look like a wide picture. */
  sheets: Record<string, SheetFile>;
  /** What the frame draws now. */
  current: string;
  onPick: (sprite: string) => void;
  /** Go to the stock library instead — this dialog closes as that one opens. */
  onImport: () => void;
  onCancel: () => void;
}

export const SpritePickerDialog = ({
  sprites,
  images,
  sheets,
  current,
  onPick,
  onImport,
  onCancel,
}: SpritePickerDialogProps) => {
  // Selecting then confirming, like the lab's other pickers: a click that
  // changed the frame under you would make browsing them costly.
  const [chosen, setChosen] = useState(current);

  return (
    <Dialog
      role="dialog"
      title={translate('Choose a picture')}
      description={translate('Every picture this project holds.')}
      onClose={onCancel}
      closeLabel={translate('Close')}
      primaryButtonProps={{
        children: translate('Use this picture'),
        disabled: !chosen,
        onClick: () => onPick(chosen),
      }}
      secondaryButtonProps={{
        children: translate('Cancel'),
        onClick: onCancel,
      }}
      customContent={
        <div className={styles.body}>
          {sprites.length === 0 ? (
            <Typography variant="body2">
              {translate('This project has no pictures yet.')}
            </Typography>
          ) : (
            <ul className={styles.grid}>
              {sprites.map(name => (
                <li key={name}>
                  <Button
                    className={styles.item}
                    variant={name === chosen ? 'contained' : 'outlined'}
                    color="secondary"
                    size="small"
                    fullWidth
                    aria-pressed={name === chosen}
                    onClick={() => setChosen(name)}
                    onDoubleClick={() => onPick(name)}
                  >
                    <img
                      className={styles.preview}
                      src={images[name]?.src}
                      alt=""
                      aria-hidden="true"
                    />
                    <span className={styles.text}>
                      <Typography
                        component="span"
                        variant="body4"
                        color="inherit"
                      >
                        {name}
                      </Typography>
                      {sheets[name] && (
                        <Typography
                          component="span"
                          variant="body4"
                          color="inherit"
                        >
                          {translate('Spritesheet')}
                        </Typography>
                      )}
                    </span>
                  </Button>
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
