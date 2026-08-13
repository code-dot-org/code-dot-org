// The shelf behind a `set background to` dropdown's `(import…)` row.
//
// Thumbnails, and no names on them. A backdrop is a place — a cave, a city, a
// tennis court — and "cave" versus "court" is a worse question than looking at
// the two. The names are there for a screen reader and in a tooltip, which is
// the same arrangement the picture palette settled on.
//
// Its own dialog rather than a `kind` of `ImportAppearanceDialog`: that one
// lists rows with a description and a promise of which files an import writes,
// because a sprite's import can bring a `.sheet` and an animation drags its
// frames along. A backdrop writes one file and always the same one, so the row
// would be a sentence saying nothing beside a picture saying everything.
//
// Each tile loads from the served URL (BACKGROUNDS.md §7), so opening this
// dialog fetches the library; choosing one fetches nothing new — the bytes are
// in the browser's cache by then, and `fetchStockBackground` inlines them.

import {Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import styles from './backgroundLibraryDialog.module.css';
import {stockBackgrounds, type StockBackground} from './stock';

export interface BackgroundLibraryDialogProps {
  /** Chosen — fetch its bytes and copy it into the project. */
  onImport: (chosen: StockBackground) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
  /** What went wrong with the last import, if anything did. */
  error?: string;
  /** True while the chosen one's bytes are being fetched. */
  busy?: boolean;
}

export const BackgroundLibraryDialog = ({
  onImport,
  onCancel,
  error,
  busy = false,
}: BackgroundLibraryDialogProps) => {
  const backgrounds = stockBackgrounds();
  // Selecting then confirming, like the picture palette: a click that imported
  // would make browsing the shelf expensive.
  const [chosen, setChosen] = useState<string>('');
  const picked = backgrounds.find(background => background.id === chosen);

  return (
    <Dialog
      role="dialog"
      title="Choose a background"
      description="A background is drawn behind everything, stretched to fill the view."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: busy ? 'Adding…' : 'Use this background',
        disabled: !picked || busy,
        onClick: () => picked && onImport(picked),
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        onClick: onCancel,
      }}
      customContent={
        <div className={styles.body}>
          {backgrounds.length === 0 ? (
            <Typography variant="body2">
              There are no backgrounds to choose from.
            </Typography>
          ) : (
            <ul className={styles.shelf}>
              {backgrounds.map(background => (
                <li key={background.id}>
                  <button
                    type="button"
                    className={
                      background.id === chosen
                        ? `${styles.tile} ${styles.tileChosen}`
                        : styles.tile
                    }
                    aria-pressed={background.id === chosen}
                    aria-label={background.name}
                    title={background.name}
                    onClick={() => setChosen(background.id)}
                    onDoubleClick={() => !busy && onImport(background)}
                  >
                    <img
                      className={styles.thumb}
                      src={background.url}
                      alt=""
                      loading="lazy"
                      draggable={false}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </div>
      }
    />
  );
};
