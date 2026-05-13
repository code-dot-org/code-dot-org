import styles from './stagePrimitives.module.scss';

/**
 * Sticky-note style sentence-starter for free-response steps. Feels like an
 * invitation to type, not a homework prompt. Three pulsing dots imply
 * "the tutor is listening" — until you start typing, when they freeze.
 *
 * Intentionally pure-CSS animation only (no state) — it just sits next to
 * the chat panel where the textarea lives.
 */
interface Props {
  prompt: string;
}

const ReflectionInvitation = ({prompt}: Props) => (
  <div className={styles.host}>
    <h2 className={styles.headline}>Your turn to think.</h2>
    <p className={styles.subhead}>
      Type it in your own words. There&apos;s no wrong answer.
    </p>

    <div className={styles.riCard}>
      <svg
        viewBox="0 0 240 80"
        width="200"
        height="80"
        aria-hidden="true"
      >
        <path
          d="M 16 8
             Q 0 8 0 24
             L 0 56
             Q 0 72 16 72
             L 60 72
             L 64 80
             L 80 72
             L 224 72
             Q 240 72 240 56
             L 240 24
             Q 240 8 224 8 Z"
          fill="white"
          stroke="rgb(92,33,193)"
          strokeWidth="4"
        />
      </svg>
      <div className={styles.riDots} aria-hidden="true">
        <span className={styles.riDot} />
        <span className={styles.riDot} />
        <span className={styles.riDot} />
      </div>
      <p className={styles.riPrompt}>{prompt}</p>
    </div>
  </div>
);

export default ReflectionInvitation;
