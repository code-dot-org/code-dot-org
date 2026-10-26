// How many tiles an actor fills, chosen by drawing the rectangle it fills.
//
// A number pair is the wrong question to ask a learner. "Scale x 2, scale y 3"
// is two abstractions — a multiplier, and which axis is which — in front of
// something they can point at: a shape, two tiles across and three up. So the
// widget IS the shape, and the answer is read off it.
//
// FROM THE BOTTOM LEFT, because that is the corner a thing stands in. Filling
// grows right and up, the directions a wider and a taller actor grow in, and
// the square already filled is the one every actor starts as: one tile, which
// is what fitting a picture to a tile made the unit (specs/ACTOR_SIZE.md).
//
// COLUMNS ARE ACROSS AND ROWS ARE UP, which is to say the rectangle drawn is
// the rectangle got. It is worth stating because it is the one thing here that
// could be the other way round, and a widget where clicking a wide shape made
// a tall actor would be wrong in a way nobody would report — they would simply
// stop using it.

import {Typography} from '@mui/material';

import styles from './scaleGrid.module.css';

/** How many tiles an actor fills, each way. */
export interface TileScale {
  x: number;
  y: number;
}

export interface ScaleGridProps {
  value: TileScale;
  onChange: (value: TileScale) => void;
  /**
   * How many squares each way.
   *
   * Four, which is a judgement rather than a limit: a learner wanting a
   * five-tile actor can say so in the blocks afterwards, and a grid big enough
   * for every want is a grid nobody can hit the corner of.
   */
  squares?: number;
  /** Left out where nothing may be changed. */
  disabled?: boolean;
}

/** What the chosen shape is called, for a reader who is not looking at it. */
export const scaleSaid = ({x, y}: TileScale): string =>
  x === 1 && y === 1 ? 'one tile' : `${x} across, ${y} up`;

export const ScaleGrid = ({
  value,
  onChange,
  squares = 4,
  disabled = false,
}: ScaleGridProps) => {
  // Top row first, because that is the order a grid lays out and the order a
  // reader's eye takes: the bottom row is the last one drawn and the one the
  // filling starts from.
  const rows = Array.from({length: squares}, (_, at) => squares - at);

  return (
    <div className={styles.row}>
      <ul
        className={styles.grid}
        style={{['--squares' as string]: squares}}
        aria-label="How many tiles it fills"
      >
        {rows.map(up =>
          Array.from({length: squares}, (_, at) => at + 1).map(across => {
            const filled = across <= value.x && up <= value.y;
            return (
              <li key={`${across}:${up}`} style={{display: 'contents'}}>
                <button
                  type="button"
                  className={
                    filled ? `${styles.square} ${styles.filled}` : styles.square
                  }
                  aria-label={`${across} across, ${up} up`}
                  aria-pressed={filled}
                  disabled={disabled}
                  onClick={() => onChange({x: across, y: up})}
                />
              </li>
            );
          }),
        )}
      </ul>
      <Typography variant="body4" className={styles.said}>
        {scaleSaid(value)}
      </Typography>
    </div>
  );
};

export default ScaleGrid;
