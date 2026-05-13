import Markdown from 'markdown-to-jsx';

import {MARKDOWN_OPTIONS} from '@code-dot-org/ai-tutor';

import styles from './stagePrimitives.module.scss';

/**
 * The `wrap` step's emotional payoff. Four lab tiles "land" in sequence,
 * then a purple medallion pops in. Pure CSS animation (delay-based stagger);
 * no state, no JS timers — mount once and let it play.
 *
 * Optionally streams a checklist of summary bullets beneath the medallion
 * — rendered through the package's shared MARKDOWN_OPTIONS so authored
 * `**bold**` / `code` / lists in the lesson's `summary[]` come through.
 */

const TILES = [
  {label: '🎵', bg: 'rgb(0,173,184)', name: 'Music'},
  {label: '🧩', bg: 'rgb(254,168,55)', name: 'Maze'},
  {label: '📊', bg: 'rgb(92,33,193)', name: 'Data'},
  {label: '✨', bg: 'rgb(0,173,184)', name: 'AI'},
] as const;

interface Props {
  summary?: string[];
}

const LessonCelebration = ({summary}: Props) => (
  <div className={styles.host}>
    <h2 className={styles.headline}>You did this.</h2>
    <p className={styles.subhead}>
      Four labs. One conversation. Two big ideas.
    </p>

    <div className={styles.lcGrid}>
      {TILES.map((tile, i) => (
        <div
          key={tile.name}
          className={styles.lcTile}
          style={{
            background: tile.bg,
            animationDelay: `${i * 220}ms`,
          }}
          aria-label={tile.name}
        >
          <span aria-hidden="true">{tile.label}</span>
        </div>
      ))}
    </div>

    <div className={styles.lcMedallion}>Loops + Conditions ⭐</div>

    {summary && summary.length > 0 && (
      <ul className={styles.lcSummary}>
        {summary.map((item, i) => (
          <li
            key={i}
            className={styles.lcSummaryItem}
            style={{
              // Sequence in after the medallion finishes (~1.9s) so the
              // celebration plays first, then the recap unfolds.
              animationDelay: `${1900 + i * 220}ms`,
            }}
          >
            <Markdown options={MARKDOWN_OPTIONS}>{item}</Markdown>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default LessonCelebration;
