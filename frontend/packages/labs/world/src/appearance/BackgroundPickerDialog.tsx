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

import {Typography} from '@mui/material';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './backgroundPickerDialog.module.css';

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
  onCancel: () => void;
}

export const BackgroundPickerDialog = ({
  backgrounds,
  onOpen,
  onImport,
  onNew,
  onUpload,
  onCancel,
}: BackgroundPickerDialogProps) => {
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
      primaryButtonProps={{children: 'Done', onClick: onCancel}}
      customContent={
        <div className={styles.body}>
          <ul className={styles.shelf}>
            {action('import', 'download', 'Import', onImport)}
            {onNew && action('new', 'plus', 'New', onNew)}
            {onUpload && action('upload', 'upload', 'Upload', onUpload)}
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
        </div>
      }
    />
  );
};

export default BackgroundPickerDialog;
