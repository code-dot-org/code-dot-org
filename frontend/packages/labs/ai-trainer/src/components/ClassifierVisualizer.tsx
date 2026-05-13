import {useMemo} from 'react';

import {TEST_SET, TRAINING_SET, type Creature, type Label} from '../dataset';

import styles from './classifierVisualizer.module.scss';

/**
 * A 2D feature-space view of every creature in the dataset. The point of the
 * visualizer is to show *how the classifier reasons* — not just what it
 * predicts. Each algorithm gets a different overlay:
 *
 *   - **nearest-neighbor**: a line from the current test creature to the
 *     training neighbor whose label it copies. The thicker the line, the
 *     closer the match.
 *   - **eyes-rule** / **size-rule**: a tinted decision band over the side
 *     of the plot the rule selects for each label.
 *   - **majority**: a faint tint of the winning label color across the
 *     whole canvas, plus the same training-tally that already lived in the
 *     side panel.
 *
 * Axes:
 *   x → eyes (1 on left, 3 on right)
 *   y → size (small on top, large on bottom)
 *
 * Training creatures show their label colors. Test creatures start gray
 * (label hidden) and only flip to their predicted color on the frame they
 * are revealed.
 */

interface Highlight {
  testId?: number;
  trainingId?: number;
}

export interface ClassifierVisualizerProps {
  algorithm:
    | 'majority'
    | 'nearest-neighbor'
    | 'eyes-rule'
    | 'size-rule'
    | null;
  /** Map of test creature id → predicted label, for rows already revealed. */
  predictions: Map<number, {predicted: Label; correct: boolean}>;
  /** Which test creature and/or training neighbor the current frame highlights. */
  highlight: Highlight;
  /** Set of test creature ids revealed by the current frame. */
  revealed: Set<number>;
  /**
   * Used by `majority`: which label won the popular vote in training.
   * `null` for other algorithms; the visualizer omits the canvas tint.
   */
  majorityWinner?: Label | null;
}

// Pixel layout: 4 quadrants in a 2×2 grid (eyes × size). Each quadrant is
// padded so creatures can spread out a little without colliding.
const W = 380;
const H = 320;
const PADDING = 28;
const QUAD_W = (W - PADDING * 2) / 2;
const QUAD_H = (H - PADDING * 2) / 2;

const FRIEND_COLOR = '#22c55e';
const FOE_COLOR = '#ef4444';
const UNKNOWN_COLOR = '#94a3b8';

/** Deterministic jitter so creatures stacked in the same cell spread out. */
function jitter(id: number, axis: 'x' | 'y'): number {
  const seed = id * (axis === 'x' ? 7 : 13);
  // Hash → [-1, 1]
  return ((Math.sin(seed) + 1) % 1) * 2 - 1;
}

function position(creature: Creature): {x: number; y: number} {
  // Each quadrant centers at (PADDING + QUAD_W/2 + col*QUAD_W, …).
  const col = creature.eyes === 1 ? 0 : 1;
  const row = creature.size === 'small' ? 0 : 1;
  const cx = PADDING + QUAD_W / 2 + col * QUAD_W;
  const cy = PADDING + QUAD_H / 2 + row * QUAD_H;
  // Spread up to ±36 px so a stack of 3 fits with breathing room.
  const dx = jitter(creature.id, 'x') * 38;
  const dy = jitter(creature.id, 'y') * 28;
  return {x: cx + dx, y: cy + dy};
}

const ClassifierVisualizer = ({
  algorithm,
  predictions,
  highlight,
  revealed,
  majorityWinner,
}: ClassifierVisualizerProps) => {
  const trainingPositions = useMemo(
    () => TRAINING_SET.map(c => ({c, ...position(c)})),
    [],
  );
  const testPositions = useMemo(
    () => TEST_SET.map(c => ({c, ...position(c)})),
    [],
  );

  const highlightedTest = highlight.testId
    ? testPositions.find(t => t.c.id === highlight.testId)
    : null;
  const highlightedTraining = highlight.trainingId
    ? trainingPositions.find(t => t.c.id === highlight.trainingId)
    : null;

  // Decision-band overlay for rule-based algorithms.
  const ruleBand = useMemo(() => {
    if (algorithm === 'eyes-rule') {
      // Left half (1 eye) → friend, right half (3 eyes) → foe.
      return {
        friend: {x: 0, y: 0, width: W / 2, height: H},
        foe: {x: W / 2, y: 0, width: W / 2, height: H},
      };
    }
    if (algorithm === 'size-rule') {
      // Top half (small) → friend, bottom half (large) → foe.
      return {
        friend: {x: 0, y: 0, width: W, height: H / 2},
        foe: {x: 0, y: H / 2, width: W, height: H / 2},
      };
    }
    return null;
  }, [algorithm]);

  const majorityTint =
    algorithm === 'majority' && majorityWinner
      ? majorityWinner === 'friend'
        ? FRIEND_COLOR
        : FOE_COLOR
      : null;

  return (
    <div className={styles.host}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className={styles.plot}
        aria-label="Classifier visualization"
      >
        <rect x={0} y={0} width={W} height={H} className={styles.canvas} />

        {/* Majority: full-canvas tint of the winning label. */}
        {majorityTint && (
          <rect
            x={0}
            y={0}
            width={W}
            height={H}
            fill={majorityTint}
            opacity={0.08}
          />
        )}

        {/* Rule-based: tinted decision bands. */}
        {ruleBand && (
          <>
            <rect
              {...ruleBand.friend}
              fill={FRIEND_COLOR}
              opacity={0.1}
            />
            <rect {...ruleBand.foe} fill={FOE_COLOR} opacity={0.1} />
          </>
        )}

        {/* Axis cross-hairs. */}
        <line
          x1={W / 2}
          y1={PADDING}
          x2={W / 2}
          y2={H - PADDING}
          className={styles.axis}
        />
        <line
          x1={PADDING}
          y1={H / 2}
          x2={W - PADDING}
          y2={H / 2}
          className={styles.axis}
        />

        {/* Axis labels. */}
        <text x={PADDING / 2 + 30} y={H / 2 - 8} className={styles.axisLabel}>
          ← 1 eye
        </text>
        <text
          x={W - PADDING / 2 - 60}
          y={H / 2 - 8}
          className={styles.axisLabel}
          textAnchor="end"
        >
          3 eyes →
        </text>
        <text
          x={W / 2 + 8}
          y={PADDING / 2 + 12}
          className={styles.axisLabel}
        >
          small ↑
        </text>
        <text
          x={W / 2 + 8}
          y={H - PADDING / 2 + 4}
          className={styles.axisLabel}
        >
          ↓ large
        </text>

        {/* Nearest-neighbor: connection line from test to training neighbor. */}
        {algorithm === 'nearest-neighbor' &&
          highlightedTest &&
          highlightedTraining && (
            <line
              x1={highlightedTest.x}
              y1={highlightedTest.y}
              x2={highlightedTraining.x}
              y2={highlightedTraining.y}
              className={styles.nnLine}
            />
          )}

        {/* Training creatures — always labeled. */}
        {trainingPositions.map(({c, x, y}) => {
          const isHi = highlightedTraining?.c.id === c.id;
          return (
            <CreatureDot
              key={`train-${c.id}`}
              creature={c}
              x={x}
              y={y}
              fill={c.label === 'friend' ? FRIEND_COLOR : FOE_COLOR}
              isTraining
              highlighted={isHi}
            />
          );
        })}

        {/* Test creatures — gray until revealed, then predicted color. */}
        {testPositions.map(({c, x, y}) => {
          const pred = predictions.get(c.id);
          const isRevealed = revealed.has(c.id);
          const isHi = highlightedTest?.c.id === c.id;
          const fill =
            isRevealed && pred
              ? pred.predicted === 'friend'
                ? FRIEND_COLOR
                : FOE_COLOR
              : UNKNOWN_COLOR;
          return (
            <CreatureDot
              key={`test-${c.id}`}
              creature={c}
              x={x}
              y={y}
              fill={fill}
              isTraining={false}
              highlighted={isHi}
              correctness={pred?.correct}
            />
          );
        })}
      </svg>

      <div className={styles.legend}>
        <LegendDot color={FRIEND_COLOR} label="friend" />
        <LegendDot color={FOE_COLOR} label="foe" />
        <LegendDot color={UNKNOWN_COLOR} label="unknown" />
        <span className={styles.legendNote}>
          <span className={styles.legendTrainingMark} /> outlined = training
          (model knows the answer)
        </span>
      </div>
    </div>
  );
};

interface CreatureDotProps {
  creature: Creature;
  x: number;
  y: number;
  fill: string;
  isTraining: boolean;
  highlighted: boolean;
  correctness?: boolean;
}

function CreatureDot({
  creature,
  x,
  y,
  fill,
  isTraining,
  highlighted,
  correctness,
}: CreatureDotProps) {
  const radius = creature.size === 'small' ? 14 : 18;
  return (
    <g
      className={[
        styles.dot,
        highlighted ? styles.dotHighlighted : '',
        isTraining ? styles.dotTraining : styles.dotTest,
      ]
        .filter(Boolean)
        .join(' ')}
      transform={`translate(${x} ${y})`}
    >
      <circle
        r={radius}
        fill={fill}
        stroke={isTraining ? '#1f2937' : 'rgba(31,41,55,0.3)'}
        strokeWidth={isTraining ? 2.5 : 1.5}
      />
      {/* Eye markers — one or three white dots on the face. */}
      {Array.from({length: creature.eyes}).map((_, i) => {
        const angle = (i / creature.eyes) * Math.PI * 2 - Math.PI / 2;
        const r = creature.eyes === 1 ? 0 : radius * 0.4;
        return (
          <circle
            key={i}
            cx={Math.cos(angle) * r}
            cy={Math.sin(angle) * r}
            r={creature.size === 'small' ? 2.5 : 3}
            fill="white"
          />
        );
      })}
      <text
        y={radius + 11}
        textAnchor="middle"
        className={styles.idLabel}
      >
        #{creature.id}
      </text>
      {correctness === false && (
        <text
          x={radius - 4}
          y={-radius + 6}
          className={styles.wrongMark}
          textAnchor="middle"
        >
          ✕
        </text>
      )}
    </g>
  );
}

function LegendDot({color, label}: {color: string; label: string}) {
  return (
    <span className={styles.legendItem}>
      <span className={styles.legendDot} style={{background: color}} />
      {label}
    </span>
  );
}

export default ClassifierVisualizer;
