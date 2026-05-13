import styles from './stagePrimitives.module.scss';

/**
 * One fish drops in, the student watches it slide into the `fish` bucket
 * with a `tag: fish` chip stuck to it; three more items rain in and
 * auto-sort. Wire labeled `training data` snakes out to a `model` box.
 *
 * Frames are pure CSS animations on a single SVG — no JS state. The
 * `tag` chip persisting on the fish *inside* the bucket is the whole
 * teaching move: label and data are the same physical object.
 */

const LabelBucket = () => (
  <div className={styles.host}>
    <h2 className={styles.headline}>Every click becomes a note.</h2>
    <p className={styles.subhead}>
      Each label you give sticks to the example forever. The set of all
      labeled examples is the <strong>training data</strong>.
    </p>

    <svg
      viewBox="0 0 520 360"
      width="100%"
      className={styles.lbStage}
      aria-label="Label sticking to fish, fish dropping into bucket"
    >
      <defs>
        <linearGradient id="lbTealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(0,193,204)" />
          <stop offset="100%" stopColor="rgb(0,143,154)" />
        </linearGradient>
        <linearGradient id="lbOrangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(254,188,75)" />
          <stop offset="100%" stopColor="rgb(224,148,35)" />
        </linearGradient>
      </defs>

      {/* Fish 1 — drops into the teal bucket, keeps its chip. */}
      <g className={styles.lbFish1}>
        <ellipse cx="0" cy="0" rx="22" ry="14" fill="rgb(0,173,184)" />
        <polygon points="-22,0 -32,-10 -32,10" fill="rgb(0,173,184)" />
        <circle cx="8" cy="-3" r="3" fill="white" />
        <circle cx="8" cy="-3" r="1.5" fill="rgb(28,27,31)" />
        <g className={styles.lbChip}>
          <rect
            x="-22"
            y="-36"
            rx="8"
            ry="8"
            width="44"
            height="18"
            fill="rgb(0,173,184)"
          />
          <text
            x="0"
            y="-23"
            fill="white"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            fish
          </text>
        </g>
      </g>

      {/* Fish 2 — same teal bucket. */}
      <g className={styles.lbFish2}>
        <ellipse cx="0" cy="0" rx="20" ry="12" fill="rgb(0,173,184)" />
        <polygon points="-20,0 -28,-9 -28,9" fill="rgb(0,173,184)" />
        <circle cx="7" cy="-3" r="2.5" fill="white" />
      </g>

      {/* Trash 1 — drops into the orange bucket, gets a `not fish` chip. */}
      <g className={styles.lbTrash1}>
        <rect
          x="-16"
          y="-12"
          width="32"
          height="20"
          rx="3"
          fill="rgb(254,168,55)"
          opacity="0.85"
        />
        <rect
          x="-12"
          y="-16"
          width="24"
          height="6"
          rx="2"
          fill="rgb(254,168,55)"
        />
        <g className={styles.lbChip}>
          <rect
            x="-32"
            y="-38"
            rx="8"
            ry="8"
            width="64"
            height="18"
            fill="rgb(254,168,55)"
          />
          <text
            x="0"
            y="-25"
            fill="white"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            not fish
          </text>
        </g>
      </g>

      {/* Teal "fish" bucket. */}
      <g transform="translate(140, 280)">
        <path
          d="M -56 -28 L 56 -28 L 48 38 L -48 38 Z"
          fill="url(#lbTealGrad)"
        />
        <rect x="-58" y="-32" width="116" height="10" rx="4" fill="rgb(0,143,154)" />
        <text
          y="20"
          fill="white"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          fish
        </text>
      </g>

      {/* Orange "not fish" bucket. */}
      <g transform="translate(380, 280)">
        <path
          d="M -56 -28 L 56 -28 L 48 38 L -48 38 Z"
          fill="url(#lbOrangeGrad)"
        />
        <rect
          x="-58"
          y="-32"
          width="116"
          height="10"
          rx="4"
          fill="rgb(224,148,35)"
        />
        <text
          y="20"
          fill="white"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          not fish
        </text>
      </g>

      {/* Wire to the model — teal pulse line. */}
      <path
        d="M 260 290 Q 260 340 320 340"
        stroke="rgb(92,33,193)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="6 6"
        className={styles.lbWire}
      />

      {/* Model box. */}
      <g transform="translate(440, 340)">
        <rect
          x="-44"
          y="-14"
          width="88"
          height="28"
          rx="14"
          fill="rgb(92,33,193)"
        />
        <text
          y="5"
          fill="white"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          model
        </text>
      </g>
    </svg>
  </div>
);

export default LabelBucket;
