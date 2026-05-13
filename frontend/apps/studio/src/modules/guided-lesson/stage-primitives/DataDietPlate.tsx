import styles from './stagePrimitives.module.scss';

/**
 * Bias as a gap between two visuals: a *plate* of training examples (all
 * silver fish) and a *pond* full of varied creatures. The model is the
 * lens between them. The misses pile up because the plate never contained
 * the kinds the pond is throwing at it.
 *
 * Pure CSS animation, no state — the still image alone teaches; the gentle
 * pulse on the plate vs pond just helps the eye traverse the gap.
 */

const PLATE_FISH = [0, 1, 2, 3, 4]; // five silver fish, identical
const POND_CREATURES = [
  {color: 'rgb(254,168,55)', shape: 'fish'},
  {color: 'rgb(217,70,239)', shape: 'spotted'},
  {color: 'rgb(0,173,184)', shape: 'fish'},
  {color: 'rgb(34,197,94)', shape: 'eel'},
  {color: 'rgb(254,168,55)', shape: 'spotted'},
  {color: 'rgb(148,163,184)', shape: 'fish'},
] as const;

const DataDietPlate = () => (
  <div className={styles.host}>
    <h2 className={styles.headline}>What the model ate vs what the model meets.</h2>
    <p className={styles.subhead}>
      The pond has more kinds of fish than your plate had. The model
      can only recognize what it has <strong>seen labeled</strong>.
    </p>

    <svg
      viewBox="0 0 520 380"
      width="100%"
      className={styles.ddStage}
      aria-label="Plate of silver fish next to a pond of varied creatures"
    >
      {/* Plate (training data). */}
      <g transform="translate(130, 130)">
        <ellipse cx="0" cy="0" rx="110" ry="28" fill="#e2e8f0" />
        <ellipse cx="0" cy="-4" rx="92" ry="20" fill="#f8fafc" />
        {PLATE_FISH.map(i => {
          const x = -64 + i * 32;
          return (
            <g key={i} transform={`translate(${x}, -8)`}>
              <ellipse cx="0" cy="0" rx="12" ry="7" fill="rgb(148,163,184)" />
              <polygon points="-12,0 -18,-5 -18,5" fill="rgb(148,163,184)" />
              <circle cx="4" cy="-1" r="1.5" fill="white" />
            </g>
          );
        })}
        <text
          y="48"
          fill="rgb(28,27,31)"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          training plate
        </text>
        <text
          y="64"
          fill="rgb(74,71,96)"
          fontSize="11"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          5 silver fish
        </text>
      </g>

      {/* Model lens between plate and pond. */}
      <g transform="translate(260, 200)" className={styles.ddLens}>
        <circle r="32" fill="none" stroke="rgb(92,33,193)" strokeWidth="3" />
        <text
          y="5"
          fill="rgb(92,33,193)"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          model
        </text>
      </g>

      {/* Pond (test data). */}
      <g transform="translate(400, 200)">
        <rect
          x="-90"
          y="-70"
          width="180"
          height="140"
          rx="20"
          fill="rgba(0,173,184,0.12)"
          stroke="rgb(0,173,184)"
          strokeWidth="2"
        />
        {POND_CREATURES.map((c, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = -56 + col * 56;
          const y = -32 + row * 56;
          // Mark misses on non-silver creatures — model only knows silver fish.
          const isMiss = c.color !== 'rgb(148,163,184)';
          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {c.shape === 'eel' ? (
                <path
                  d="M -14 0 Q -8 -6 0 0 T 14 0"
                  stroke={c.color}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <ellipse cx="0" cy="0" rx="12" ry="7" fill={c.color} />
                  <polygon
                    points="-12,0 -18,-5 -18,5"
                    fill={c.color}
                  />
                  <circle cx="4" cy="-1" r="1.5" fill="white" />
                  {c.shape === 'spotted' && (
                    <>
                      <circle cx="-2" cy="-3" r="1.5" fill="white" />
                      <circle cx="2" cy="3" r="1.5" fill="white" />
                    </>
                  )}
                </>
              )}
              {isMiss && (
                <text
                  x="16"
                  y="-6"
                  fill="rgb(220,38,38)"
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  ✕
                </text>
              )}
            </g>
          );
        })}
        <text
          y="92"
          fill="rgb(28,27,31)"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          test pond
        </text>
        <text
          y="108"
          fill="rgb(220,38,38)"
          fontSize="11"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          5 of 6 misses
        </text>
      </g>
    </svg>
  </div>
);

export default DataDietPlate;
