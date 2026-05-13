import styles from './stagePrimitives.module.scss';

/**
 * The TikTok / For You tie-in. A phone scrolls thumbnails; each swipe sends
 * its tag into the model box. The model beams back a narrower feed; one
 * thumbnail falls *off* the phone into a `not shown` bin. The third frame
 * is the load-bearing one — recommendation is **subtraction**, not magic.
 *
 * Pure CSS scroll loop. No state.
 */

const FeedMirror = () => (
  <div className={styles.host}>
    <h2 className={styles.headline}>Your feed is a classifier.</h2>
    <p className={styles.subhead}>
      Every swipe is a <strong>label</strong>. The more you teach it, the
      more it shows you — and the more it <em>stops</em> showing you.
    </p>

    <svg
      viewBox="0 0 520 420"
      width="100%"
      className={styles.fmStage}
      aria-label="Phone feed teaching a model what to keep showing"
    >
      <defs>
        <clipPath id="fmPhoneClip">
          <rect x="170" y="40" width="180" height="340" rx="20" />
        </clipPath>
      </defs>

      {/* Phone shell. */}
      <rect
        x="160"
        y="30"
        width="200"
        height="360"
        rx="28"
        fill="rgb(28,27,31)"
      />
      <rect
        x="170"
        y="40"
        width="180"
        height="340"
        rx="20"
        fill="rgb(15,23,42)"
      />
      <circle cx="260" cy="370" r="6" fill="rgb(74,71,96)" />

      {/* Scrolling thumbnails inside the clip. */}
      <g clipPath="url(#fmPhoneClip)">
        <g className={styles.fmScroll}>
          {[
            {tag: 'skate', color: 'rgb(254,168,55)'},
            {tag: 'dog', color: 'rgb(0,173,184)'},
            {tag: 'skate', color: 'rgb(254,168,55)'},
            {tag: 'dance', color: 'rgb(217,70,239)'},
            {tag: 'skate', color: 'rgb(254,168,55)'},
            {tag: 'skate', color: 'rgb(254,168,55)'},
            {tag: 'skate', color: 'rgb(254,168,55)'},
            {tag: 'dance', color: 'rgb(217,70,239)'},
          ].map((thumb, i) => (
            <g key={i} transform={`translate(180, ${50 + i * 80})`}>
              <rect width="160" height="68" rx="10" fill={thumb.color} />
              <rect
                x="8"
                y="44"
                width="60"
                height="16"
                rx="8"
                fill="rgba(0,0,0,0.5)"
              />
              <text
                x="38"
                y="56"
                fill="white"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
              >
                {thumb.tag}
              </text>
            </g>
          ))}
        </g>
      </g>

      {/* Model — receives the labels. */}
      <g transform="translate(80, 200)">
        <rect
          x="-46"
          y="-22"
          width="92"
          height="44"
          rx="14"
          fill="rgb(92,33,193)"
        />
        <text
          y="6"
          fill="white"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          model
        </text>
        <text
          y="40"
          fill="rgb(74,71,96)"
          fontSize="11"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          watching
        </text>
      </g>

      {/* Beam from model back to phone — narrowing feedback. */}
      <path
        d="M 126 200 Q 150 200 168 200"
        stroke="rgb(0,173,184)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="4 4"
        className={styles.fmBeam}
      />
      <path
        d="M 350 200 Q 380 200 400 200"
        stroke="rgb(254,168,55)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="4 4"
        className={styles.fmBeam}
      />

      {/* `not shown` bin — what gets subtracted. */}
      <g transform="translate(450, 200)">
        <rect
          x="-44"
          y="-30"
          width="88"
          height="60"
          rx="10"
          fill="rgba(254,168,55,0.18)"
          stroke="rgb(254,168,55)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <text
          y="-8"
          fill="rgb(28,27,31)"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          not shown
        </text>
        <text
          y="10"
          fill="rgb(74,71,96)"
          fontSize="10"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          (cooking,
        </text>
        <text
          y="22"
          fill="rgb(74,71,96)"
          fontSize="10"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          news, art…)
        </text>
      </g>
    </svg>

    <p className={styles.subhead} style={{marginTop: 4}}>
      What&apos;s <strong>missing</strong> is a choice too.
    </p>
  </div>
);

export default FeedMirror;
