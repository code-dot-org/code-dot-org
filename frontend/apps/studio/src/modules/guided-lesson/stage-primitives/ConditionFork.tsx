import {useState} from 'react';

import styles from './stagePrimitives.module.scss';

/**
 * Companion to the `cond-intro` concept step. Shows the if/else as a single
 * decision: one question, two paths, one answer at a time. Auto-loops
 * yes/no slowly so a kid who is just watching still gets the pattern, but
 * the take-home is the *shape* of branching — the purple diamond, the two
 * blocks, only one ever lighting up at once.
 */

type Side = 'yes' | 'no';

const ConditionFork = () => {
  // Student-driven only — no idle auto-alternation. Tap YES/NO to flip.
  const [side, setSide] = useState<Side>('yes');

  return (
    <div className={styles.host}>
      <h2 className={styles.headline}>Ask, then choose.</h2>
      <p className={styles.subhead}>
        A <strong>condition</strong> is a yes/no question. The answer picks
        which block runs next.
      </p>

      <div className={styles.cfBoard}>
        <svg
          className={styles.cfConnector}
          viewBox="0 0 460 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* From bottom of diamond to each branch. */}
          <path
            d="M 230 130 L 130 270"
            stroke={side === 'yes' ? 'rgb(0,173,184)' : 'rgba(28,27,31,0.2)'}
            strokeWidth="4"
            strokeDasharray={side === 'yes' ? '0' : '6 8'}
            strokeLinecap="round"
            fill="none"
            style={{transition: 'stroke 250ms ease'}}
          />
          <path
            d="M 230 130 L 330 270"
            stroke={side === 'no' ? 'rgb(254,168,55)' : 'rgba(28,27,31,0.2)'}
            strokeWidth="4"
            strokeDasharray={side === 'no' ? '0' : '6 8'}
            strokeLinecap="round"
            fill="none"
            style={{transition: 'stroke 250ms ease'}}
          />
          <text
            x="160"
            y="210"
            fill="rgb(0,173,184)"
            fontSize="14"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            YES
          </text>
          <text
            x="300"
            y="210"
            fill="rgb(254,168,55)"
            fontSize="14"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            NO
          </text>
        </svg>

        <div className={styles.cfDiamond}>
          <div className={styles.cfDiamondLabel}>path ahead?</div>
        </div>

        <div className={styles.cfBranches}>
          <div
            className={`${styles.cfBranch} ${styles.cfBranchYes} ${
              side === 'yes' ? styles.cfBranchActiveYes : ''
            }`}
          >
            move forward
          </div>
          <div
            className={`${styles.cfBranch} ${styles.cfBranchNo} ${
              side === 'no' ? styles.cfBranchActiveNo : ''
            }`}
          >
            turn right
          </div>
        </div>
      </div>

      <div className={styles.controlRow}>
        <span className={styles.qaLabel} style={{margin: 0}}>
          Try an answer
        </span>
        <div className={styles.chipGroup}>
          {(['yes', 'no'] as const).map(v => (
            <button
              key={v}
              type="button"
              className={styles.chipBtn}
              aria-pressed={side === v}
              onClick={() => setSide(v)}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConditionFork;
