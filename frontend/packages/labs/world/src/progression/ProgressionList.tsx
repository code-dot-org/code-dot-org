// The map as a list.
//
// NOT A FALLBACK, and specs/PROGRESSION_UI.md is explicit about it: an SVG of
// sixty-seven hexagons is a picture of a structure, and a picture is the wrong
// medium for two ordinary questions — "which lessons teach me about text" and
// "what can I do next" — as well as being unreadable with a screen reader.
//
// So this is the same catalogue said in the medium that suits those questions:
// headings a screen reader can jump between, a list per region, and one button
// per tile carrying the same accessible name the map's tiles carry. Nothing is
// summarised away; a tile that is locked says what it is waiting for, in words,
// where the map says it in a padlock and a dashed edge.

import {TILES} from './catalogue';
import {regionColors} from './palette';
import styles from './progressionList.module.css';
import {REGIONS, regionHue} from './regions';
import type {TileId, TileState} from './types';

import {TILES_BY_ID} from './index';

export interface ProgressionListProps {
  stateOf: (id: TileId) => TileState;
  selected?: TileId;
  onSelect: (id: TileId) => void;
}

const STATE_WORDS: Record<TileState, string> = {
  done: 'Done',
  open: 'Ready to start',
  shut: 'Locked',
};

export const ProgressionList = ({
  stateOf,
  selected,
  onSelect,
}: ProgressionListProps) => {
  return (
    <div className={styles.list}>
      {REGIONS.map(region => {
        const tiles = TILES.filter(tile => tile.region === region.id);
        // Both themes; the stylesheet picks, on the same `[data-theme]` the design
        // system's tokens are scoped by (see progressionMap.module.css).
        const hue = regionHue(region.id);
        return (
          <section
            key={region.id}
            className={styles.region}
            style={
              {
                '--swatch-light': regionColors(hue, 'light').tone,
                '--swatch-dark': regionColors(hue, 'dark').tone,
              } as React.CSSProperties
            }
            aria-labelledby={`progression-region-${region.id}`}
          >
            <h3
              className={styles.heading}
              id={`progression-region-${region.id}`}
            >
              <span className={styles.swatch} aria-hidden="true" />
              {region.name}
              <span className={styles.count}>
                {tiles.filter(tile => stateOf(tile.id) === 'done').length} of{' '}
                {tiles.length}
              </span>
            </h3>
            <p className={styles.summary}>{region.summary}</p>
            <ul className={styles.tiles}>
              {tiles.map(tile => {
                const state = stateOf(tile.id);
                const waiting = tile.requires
                  .filter(id => stateOf(id) !== 'done')
                  .map(id => TILES_BY_ID.get(id)?.title ?? id);
                return (
                  <li key={tile.id}>
                    <button
                      type="button"
                      className={`${styles.tile} ${styles[state]}`}
                      aria-current={tile.id === selected ? 'true' : undefined}
                      onClick={() => onSelect(tile.id)}
                    >
                      <span className={styles.title}>{tile.title}</span>
                      {/* The state in words, beside the color that says it in
                        the map — this is the copy a screen reader reads, and
                        the one a person scanning the list reads too. */}
                      <span className={styles.state}>
                        {STATE_WORDS[state]}
                        {waiting.length > 0 &&
                          ` — needs ${waiting.join(' and ')}`}
                      </span>
                      <span className={styles.teaches}>{tile.teaches}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
