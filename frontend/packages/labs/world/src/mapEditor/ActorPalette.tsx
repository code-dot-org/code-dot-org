// The Actor Palette: the project's actors down the side of the map editor,
// under a Game tab and an Interface tab (SIMPLE_INTERFACE.md, "Actor
// Palette"; specs/SHELL_PLAN.md, step 2).
//
// A press takes an actor as the brush, and a second press on it puts it
// down. The actor in hand is drawn with its two acts under it, Open and
// Delete, inside one ring. Add New Actor is fixed at the foot.

import {Button} from '@mui/material';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';

import {
  isUnder,
  type ActorPurpose,
  type PaletteTab,
} from '../actors/actorPurpose';
import {DEFAULT_BACKDROP_COLOR} from '../engine';

import styles from './actorPalette.module.css';
import {WithheldNote} from './WithheldNote';

export interface PaletteActor {
  /** What the actor is called: "Player". */
  name: string;
  /** Its module path, which a placement names: `actors/player`. */
  path: string;
  /** Its picture, once the sandbox has drawn one. */
  picture?: string;
  purpose: ActorPurpose;
}

export interface ActorPaletteProps {
  actors: readonly PaletteActor[];
  /** The tab it opens on: Interface for a Screen, Game for a Map. */
  startTab: PaletteTab;
  /** The actor in hand, by path, or nothing. */
  selected: string | null;
  onSelect: (path: string | null) => void;
  onOpen: (path: string) => void;
  onDelete: (path: string) => void;
  /** Add New Actor, asked with the tab it is under (specs/PURPOSE_PLAN.md). */
  onNew: (purpose: PaletteTab) => void;
  /** Whether a lesson withholds Add New Actor (`WithheldNote`). */
  newWithheld: boolean;
  /** A read-only project offers neither Delete nor Add New Actor. */
  isReadOnly: boolean;
}

export const ActorPalette = ({
  actors,
  startTab,
  selected,
  onSelect,
  onOpen,
  onDelete,
  onNew,
  newWithheld,
  isReadOnly,
}: ActorPaletteProps) => {
  const [tab, setTab] = useState<PaletteTab>(startTab);
  const shown = actors.filter(actor => isUnder(actor.purpose, tab));

  return (
    <div className={styles.palette} data-callout="map.palette">
      <div className={styles.tabs}>
        <SegmentedButtons
          size="xs"
          selectedButtonValue={tab}
          onChange={value => setTab(value as PaletteTab)}
          buttons={[
            {value: 'game', label: 'Game'},
            {value: 'interface', label: 'Interface'},
          ]}
        />
      </div>
      <ul className={styles.actors} aria-label={`${label(tab)} actors`}>
        {shown.map(actor => {
          const inHand = actor.path === selected;
          return (
            <li
              key={actor.path}
              className={
                inHand ? `${styles.cell} ${styles.inHand}` : styles.cell
              }
            >
              <button
                type="button"
                className={styles.actor}
                onClick={() => onSelect(inHand ? null : actor.path)}
                aria-pressed={inHand}
                data-callout={`map.palette:${actor.name}`}
              >
                {/* The picker's own ground behind a transparent picture, as
                    the strip had: a white Label on nothing is an empty
                    cell. */}
                <span
                  className={styles.thumb}
                  style={{background: DEFAULT_BACKDROP_COLOR}}
                >
                  {actor.picture && <img src={actor.picture} alt="" />}
                </span>
                <span className={styles.name}>{actor.name}</span>
              </button>
              {inHand && (
                <div className={styles.acts}>
                  <Button
                    variant="text"
                    size="extraSmall"
                    startIcon={
                      <FontAwesomeV6Icon
                        iconName="up-right-from-square"
                        iconStyle="solid"
                      />
                    }
                    onClick={() => onOpen(actor.path)}
                  >
                    Open
                  </Button>
                  {!isReadOnly && (
                    <Button
                      variant="text"
                      size="extraSmall"
                      startIcon={
                        <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
                      }
                      onClick={() => onDelete(actor.path)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {!isReadOnly && (
        <div className={styles.foot}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            fullWidth
            data-callout="map.newActor"
            startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
            // Focusable when withheld, and described by the note beside
            // it, so a keyboard can reach it and hear why (`WithheldNote`).
            {...(newWithheld
              ? {
                  className: styles.withheld,
                  'aria-disabled': true,
                  'aria-describedby': 'withheld-map-new-actor',
                }
              : {onClick: () => onNew(tab)})}
          >
            Add New Actor
          </Button>
          {newWithheld && (
            <WithheldNote
              affordance="map-new-actor"
              id="withheld-map-new-actor"
            />
          )}
        </div>
      )}
    </div>
  );
};

const label = (tab: PaletteTab) => (tab === 'game' ? 'Game' : 'Interface');
