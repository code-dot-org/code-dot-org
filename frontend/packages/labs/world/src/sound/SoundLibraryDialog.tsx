// The shelf behind a `play sound` dropdown's `(import…)` row.
//
// The backdrop shelf's sibling (`appearance/BackgroundLibraryDialog`), and
// deliberately so: two library dialogs that browse differently would be two
// things to learn. Same `Dialog`, same select-then-confirm, same `busy`/`error`.
//
// TWO DIFFERENCES, and both come from the same fact — a sound has no picture.
//
//   - It is a LIST, not a grid of thumbnails. There is nothing to look at, so
//     the name is the tile.
//   - Each row has a PLAY BUTTON. A backdrop tile is its own preview; a sound
//     has to be heard, and one at a time (`SoundPreview`).
//
// NOT Sprite Lab's `SoundPicker`, though the shape a learner recognises —
// browse, select, listen, choose — is taken from it. What is left behind is
// studio's: the files/sounds mode toggle and `AssetManager` (this lab's project
// files are the file tree, and a modal file manager beside it would be a second
// answer to a settled question), the recording flow, the underage warning, and
// the global `Sounds` singleton.
//
// AND THE PROJECT'S OWN, above the stock ones (specs/SHELL_FINISH_PLAN.md,
// step 4): each to hear, to use, to rename or to delete, and Upload for one
// of the learner's own. With the folder buttons gone this is where a
// project's sounds are seen at all.
//
// NO CATEGORIES. Upstream has 37 of them because it has 1598 sounds; this shelf
// has 39, and a category tree over 39 rows is furniture. The categories are in
// the upstream manifest and come back with the full library if it is ever wired
// to the studio API (specs/SOUND.md).

import {Button, Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './soundLibraryDialog.module.css';
import {SoundPreview, type MakePlayable} from './soundPreview';
import {stockSounds, type StockSound} from './stock';

/** A sound the project already holds. */
export interface OwnSound {
  fileId: string;
  /** Its file name, which is what a block names it by. */
  name: string;
  url: string;
}

export interface SoundLibraryDialogProps {
  /** Chosen — fetch its bytes and copy it into the project. */
  onImport: (chosen: StockSound) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
  /** What went wrong with the last import, if anything did. */
  error?: string;
  /** True while the chosen one's bytes are being fetched. */
  busy?: boolean;
  /** How a preview is made. The default is a real `Audio`; tests pass their own. */
  makePlayer?: MakePlayable;
  /** The project's own sounds, listed first; none, and the section is left out. */
  own?: readonly OwnSound[];
  /** One of the project's chosen: nothing to fetch, its name is the answer. */
  onUseOwn?: (name: string) => void;
  /** Bring in one of the learner's own files. */
  onUpload?: () => void;
  onRename?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
}

/** Which row is chosen: a stock sound by its id, the project's by its file. */
const OWN = 'own:';

export const SoundLibraryDialog = ({
  onImport,
  onCancel,
  error,
  busy = false,
  makePlayer,
  own = [],
  onUseOwn,
  onUpload,
  onRename,
  onDelete,
}: SoundLibraryDialogProps) => {
  const sounds = stockSounds();
  // Selecting then confirming, like the backdrop shelf — and for a sharper
  // version of its reason. "A click that imported would make browsing the shelf
  // expensive" is true of pictures and truer here, where browsing IS clicking.
  const [chosen, setChosen] = useState<string>('');
  const picked = sounds.find(sound => sound.id === chosen);
  const pickedOwn = own.find(sound => `${OWN}${sound.fileId}` === chosen);

  // One player for the life of the dialog, stopped when it goes. A preview
  // still sounding after the dialog closed is a noise with no source on screen.
  const preview = useRef<SoundPreview | null>(null);
  preview.current ??= new SoundPreview(makePlayer);
  const player = preview.current;
  useEffect(() => () => player.stop(), [player]);

  const [, redraw] = useState(0);
  const listen = (sound: {id: string; url: string}) => {
    if (player.playing() === sound.id) {
      player.stop();
    } else {
      player.play(sound.id, sound.url);
    }
    // `SoundPreview` is not React state — it owns an element, which React must
    // not own — so the row's icon is told to redraw rather than derived.
    redraw(n => n + 1);
  };

  const choose = (sound: StockSound) => {
    // Silence first: the game that is about to start is the thing to listen to.
    player.stop();
    onImport(sound);
  };

  return (
    <Dialog
      role="dialog"
      title="Choose a sound"
      description="A sound is copied into your project, and your blocks can play it."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: busy ? 'Adding…' : 'Use this sound',
        disabled: !(picked || (pickedOwn && onUseOwn)) || busy,
        onClick: () => {
          if (pickedOwn) {
            player.stop();
            onUseOwn?.(pickedOwn.name);
          } else if (picked) {
            choose(picked);
          }
        },
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        onClick: onCancel,
      }}
      customContent={
        <div className={styles.body}>
          {onUpload && (
            <Button
              variant="text"
              size="small"
              startIcon={
                <FontAwesomeV6Icon iconName="upload" iconStyle="solid" />
              }
              onClick={() => {
                player.stop();
                onUpload();
              }}
            >
              Upload a sound…
            </Button>
          )}
          {own.length > 0 && (
            <>
              <Typography variant="body2" component="h3">
                In your project
              </Typography>
              <ul className={styles.shelf} aria-label="In your project">
                {own.map(sound => {
                  const key = `${OWN}${sound.fileId}`;
                  const sounding = player.playing() === key;
                  return (
                    <li key={key} className={styles.row}>
                      <button
                        type="button"
                        className={styles.listen}
                        aria-label={
                          sounding ? `Stop ${sound.name}` : `Play ${sound.name}`
                        }
                        onClick={() => listen({id: key, url: sound.url})}
                      >
                        <FontAwesomeV6Icon
                          iconName={sounding ? 'stop' : 'play'}
                          iconStyle="solid"
                        />
                      </button>
                      <button
                        type="button"
                        className={
                          key === chosen
                            ? `${styles.choose} ${styles.chosen}`
                            : styles.choose
                        }
                        aria-pressed={key === chosen}
                        onClick={() => setChosen(key)}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          className={styles.name}
                        >
                          {sound.name}
                        </Typography>
                      </button>
                      {onRename && (
                        <Button
                          variant="text"
                          size="extraSmall"
                          aria-label={`Rename ${sound.name}`}
                          onClick={() => {
                            player.stop();
                            onRename(sound.fileId);
                          }}
                        >
                          Rename
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="text"
                          size="extraSmall"
                          aria-label={`Delete ${sound.name}`}
                          onClick={() => {
                            player.stop();
                            onDelete(sound.fileId);
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Typography variant="body2" component="h3">
                To add
              </Typography>
            </>
          )}
          {sounds.length === 0 ? (
            <Typography variant="body2">
              There are no sounds to choose from.
            </Typography>
          ) : (
            <ul className={styles.shelf}>
              {sounds.map(sound => {
                const sounding = player.playing() === sound.id;
                return (
                  <li key={sound.id} className={styles.row}>
                    <button
                      type="button"
                      className={styles.listen}
                      // Says what the button DOES next, which is what changes:
                      // the same control stops what it started.
                      aria-label={
                        sounding ? `Stop ${sound.name}` : `Play ${sound.name}`
                      }
                      onClick={() => listen(sound)}
                    >
                      <FontAwesomeV6Icon
                        iconName={sounding ? 'stop' : 'play'}
                        iconStyle="solid"
                      />
                    </button>
                    <button
                      type="button"
                      className={
                        sound.id === chosen
                          ? `${styles.choose} ${styles.chosen}`
                          : styles.choose
                      }
                      aria-pressed={sound.id === chosen}
                      onClick={() => setChosen(sound.id)}
                      onDoubleClick={() => !busy && choose(sound)}
                    >
                      {/* A span, not the default `p`: a button's content is
                          phrasing, and a paragraph inside one is invalid — the
                          backdrop shelf puts an `img` here and never met this. */}
                      <Typography
                        component="span"
                        variant="body2"
                        className={styles.name}
                      >
                        {sound.name}
                      </Typography>
                    </button>
                  </li>
                );
              })}
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

export default SoundLibraryDialog;
