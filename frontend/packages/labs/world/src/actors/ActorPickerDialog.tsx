// The actors, as a grid you look at.
//
// A menu of file names was the wrong reading of this folder. An actor is a
// thing in a world — a Player, a Coin, a Crate — and the lab already draws it
// everywhere else it is named: on the blocks that are about it
// (`blockly/actorAbout`), in every dropdown that offers it
// (`moduleOptions.pictured`), on the map. Only the list of them was words.
//
// So this is the same palette the sprite picker is (`animationEditor/
// SpritePickerDialog`), with two differences that come from what an actor is.
// The name stays under the tile, because an actor is a KIND rather than a
// drawing and two Crates that look alike are a real thing to tell apart. And
// the first tile is the way to get another one, because noticing you want one
// more happens while you are looking at the ones you have.
//
// ONE TILE, WHERE THERE WERE TWO. New and Import were a choice made before the
// question was put — "from nothing" or "from the library" asked of a learner
// who had not yet said they wanted an actor at all. They are the first two of
// the Actor Creator's three doors now, asked together and after the wanting
// (`actors/create/ActorCreator`); this tile opens it.
//
// A PICTURE IS NOT PROMISED. It is rendered by the sandbox and arrives after
// the world has compiled (`BlocklyFileEditor`), a world's own inline `define
// actor` may never get one, and this dialog can be opened before any of that.
// So the fallbacks are the ones every other surface makes: the symbol the actor
// elected, then its initial — and `onActorPictures` fills them in where the
// grid is already open.

import {Typography} from '@mui/material';
import {useEffect, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButtonWithTooltip} from '@code-dot-org/lab/components';

import {actorIconImage} from '../blockly/actorIcons';
import {
  actorIcon,
  actorThumbnail,
  onActorPictures,
} from '../blockly/actorThumbnails';

import styles from './actorPickerDialog.module.css';

/** One actor the project holds. */
export interface ActorTile {
  /** What opening it means — the file to activate. */
  fileId: string;
  /** What it is called, which is what its blocks and dropdowns call it. */
  name: string;
  /**
   * What the picture registries are keyed by: the actor's module path,
   * `actors/player` (`blockly/actorThumbnails`).
   */
  moduleKey: string;
}

export interface ActorPickerDialogProps {
  actors: readonly ActorTile[];
  /** A locked level shows its actors and offers no way to change them. */
  readOnly?: boolean;
  /** Chosen — open this one in the editor. */
  onOpen: (fileId: string) => void;
  /** Make one — the Actor Creator, which asks where it comes from. */
  onNew: () => void;
  /** Everything done TO one: rename, clone, delete, enhance. */
  onOptions?: (actor: ActorTile) => void;
  onCancel: () => void;
}

/** What to draw for an actor: its symbol, else its picture, else nothing. */
const pictureOf = (moduleKey: string): string | undefined =>
  actorIconImage(actorIcon(moduleKey) ?? '') ?? actorThumbnail(moduleKey);

export const ActorPickerDialog = ({
  actors,
  readOnly = false,
  onOpen,
  onNew,
  onOptions,
  onCancel,
}: ActorPickerDialogProps) => {
  // The pictures arrive on their own schedule; this is how a grid already on
  // screen stops being a grid of initials.
  const [, redraw] = useState(0);
  useEffect(() => onActorPictures(() => redraw(n => n + 1)), []);

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
        onClick={onClick}
      >
        <span className={styles.picture}>
          <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
        </span>
        <Typography variant="body4" className={styles.name}>
          {label}
        </Typography>
      </button>
    </li>
  );

  return (
    <Dialog
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // is for a warning that interrupts. This one is a place to choose from.
      role="dialog"
      title="Actors"
      description="Open one, or bring in another."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{children: 'Done', onClick: onCancel}}
      customContent={
        <div className={styles.body}>
          <ul className={styles.grid}>
            {!readOnly && action('new', 'plus', 'New', onNew)}
            {actors.map(actor => {
              const picture = pictureOf(actor.moduleKey);
              return (
                <li key={actor.fileId} className={styles.holder}>
                  <>
                    <button
                      type="button"
                      className={styles.tile}
                      aria-label={`Open ${actor.name}`}
                      title={actor.name}
                      onClick={() => onOpen(actor.fileId)}
                    >
                      <span className={styles.picture}>
                        {picture ? (
                          <img src={picture} alt="" />
                        ) : (
                          <span className={styles.initial} aria-hidden="true">
                            {actor.name.trim().charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <Typography variant="body4" className={styles.name}>
                        {actor.name}
                      </Typography>
                    </button>
                    {!readOnly && onOptions && (
                      <span className={styles.options}>
                        <IconButtonWithTooltip
                          id={`actor-options-${actor.fileId}`}
                          label={`Options for ${actor.name}`}
                          icon={{iconName: 'ellipsis-v', iconStyle: 'solid'}}
                          type="tertiary"
                          color="gray"
                          buttonSize="xs"
                          tooltipSize="xs"
                          tooltipDirection="onTop"
                          onClick={() => onOptions(actor)}
                        />
                      </span>
                    )}
                  </>
                </li>
              );
            })}
          </ul>
          {actors.length === 0 && (
            <Typography variant="body3" className={styles.empty}>
              This project has no actors yet.
            </Typography>
          )}
        </div>
      }
    />
  );
};

export default ActorPickerDialog;
