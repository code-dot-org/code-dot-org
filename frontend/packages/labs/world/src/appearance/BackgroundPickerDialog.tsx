// The project's backdrops, as a shelf you look at.
//
// A menu of file names was the wrong reading of this folder for the same reason
// it was wrong for the pictures: a backdrop is a PLACE — a cave, a city, a
// tennis court — and "cave.png" versus "court.png" is a worse question than
// looking at the two. So this is the grid the sprites, the actors and the
// animations already get (`animationEditor/SpritePickerDialog`,
// `actors/ActorPickerDialog`, `animationEditor/AnimationPickerDialog`), holding
// the project's own backdrops, with the ways to get another in front of them.
//
// THE SAME TILE THE SHELF USES. `BackgroundLibraryDialog` is this grid one
// import earlier — the stock backdrops rather than the copied ones — and the
// two show the same pictures, so they are the same size and stretched the same
// way. A backdrop that changed shape on the way into the project would read as
// a different backdrop.
//
// No names on the tiles, for the same reason that shelf has none: the eye does
// the choosing, and a screen reader and a tooltip carry the name for the
// question a picture cannot answer ("which one was that?").
//
// AND DESCRIBING ONE IS A TILE LIKE THE REST, which it was not: it used to sit
// under the shelf as a strip, on the grounds that it takes a sentence rather
// than a press. That reasoning was about where the SENTENCE goes, and the
// answer turned out to be "a view of its own" — a prompt and a picture big
// enough to judge do not fit under a grid (`generate/DescribePicture`). Once
// the sentence has somewhere to live, getting there is a press like the other
// three, and the shelf has one vocabulary instead of two.
//
// `Done` KEEPS WHAT IS DRAWN, the way the Actor Creator's `Next` does, and for
// the same reason: choosing a backdrop off the shelf costs one press, so a
// drawn one that wanted a second — under a button beside the one you were
// going to press anyway — is a backdrop that gets left behind.

import {Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './backgroundPickerDialog.module.css';
import {DescribePicture} from './generate/DescribePicture';
import type {GeneratedPicture, ImageGenerator} from './generate/imageGenerator';

/** One backdrop the project holds. */
export interface BackgroundTile {
  /** What opening it means — the file to activate. */
  fileId: string;
  /** What it is called, which is the name every dropdown offers it under. */
  name: string;
  /**
   * Where its bytes are.
   *
   * A copied backdrop carries them as a data URL and an uploaded one as a
   * served path (`appearance/importStock`), and both are just `src`. Absent for
   * a file the project holds some other way, which still gets a tile.
   */
  url?: string;
}

export interface BackgroundPickerDialogProps {
  backgrounds: readonly BackgroundTile[];
  /** Chosen — open this one in the image editor. */
  onOpen: (fileId: string) => void;
  /** Take one from the stock library — the same shelf the blocks open. */
  onImport: () => void;
  /** Make a blank one to draw on. Absent leaves the tile out. */
  onNew?: () => void;
  /** Take one off this machine. Absent leaves the tile out. */
  onUpload?: () => void;
  /**
   * Where a described backdrop comes from, if anywhere.
   *
   * The fourth way in, and a tile like the other three. Absent means the tile
   * is not offered at all rather than offered and broken: a lab with nothing
   * behind it should look like a lab without the feature
   * (`generate/imageGenerator`).
   */
  drawing?: ImageGenerator;
  /** Keep a drawn one — write it, and answer with its file name. */
  onKeep?: (picture: GeneratedPicture) => Promise<string | undefined>;
  onCancel: () => void;
}

export const BackgroundPickerDialog = ({
  backgrounds,
  onOpen,
  onImport,
  onNew,
  onUpload,
  drawing,
  onKeep,
  onCancel,
}: BackgroundPickerDialogProps) => {
  /** Whether the shelf has been given over to describing one. */
  const [describing, setDescribing] = useState(false);
  /** A backdrop drawn and not yet written, which `Done` writes. */
  const [pending, setPending] = useState<GeneratedPicture>();
  const [busy, setBusy] = useState(false);

  /**
   * Done: keep what is on screen, and close.
   *
   * A write that refuses leaves the dialog up with the picture still in it —
   * the panel has said why by then, and closing would take the picture with
   * it.
   */
  const done = async () => {
    if (busy) {
      return;
    }
    if (pending) {
      setBusy(true);
      const file = await onKeep?.(pending);
      setBusy(false);
      if (!file) {
        return;
      }
      setPending(undefined);
    }
    onCancel();
  };

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
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // is for a warning that interrupts. This one is a place to choose from.
      role="dialog"
      title="Backgrounds"
      description="Open one to draw on, or bring in another."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: busy ? 'Keeping the picture…' : 'Done',
        disabled: busy,
        onClick: () => void done(),
      }}
      customContent={
        <div className={styles.body}>
          {describing && onKeep ? (
            <DescribePicture
              drawing={drawing}
              kind="background"
              placeholder="a cave with glowing crystals"
              // No shape asked for: a backdrop is stretched over the viewport
              // and has no tiles to fill, so the widget the Actor Creator gets
              // would be a question meaning nothing here
              // (`generate/DescribePicture`).
              onDrew={setPending}
              onBack={() => {
                // Going back to the shelf is a rejection of the drawn one, so
                // `Done` must not then keep it.
                setPending(undefined);
                setDescribing(false);
              }}
              onKeep={onKeep}
              // …and the shelf it comes back to is the list it just joined,
              // which is the whole confirmation it needs.
              onKept={() => {
                setPending(undefined);
                setDescribing(false);
              }}
            />
          ) : (
            <>
              <ul className={styles.shelf}>
                {action('import', 'download', 'Import', onImport)}
                {onNew && action('new', 'plus', 'New', onNew)}
                {onUpload && action('upload', 'upload', 'Upload', onUpload)}
                {drawing &&
                  onKeep &&
                  action('draw', 'wand-magic-sparkles', 'Describe', () =>
                    setDescribing(true),
                  )}
                {backgrounds.map(one => (
                  <li key={one.fileId}>
                    <button
                      type="button"
                      className={styles.tile}
                      aria-label={`Open ${one.name}`}
                      title={one.name}
                      onClick={() => onOpen(one.fileId)}
                    >
                      {one.url ? (
                        <img
                          className={styles.thumb}
                          src={one.url}
                          alt=""
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <FontAwesomeV6Icon
                          iconName="mountain-sun"
                          iconStyle="solid"
                          className={styles.blank}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              {backgrounds.length === 0 && (
                <Typography variant="body3" className={styles.empty}>
                  This project has no backgrounds yet.
                </Typography>
              )}
            </>
          )}
        </div>
      }
    />
  );
};

export default BackgroundPickerDialog;
