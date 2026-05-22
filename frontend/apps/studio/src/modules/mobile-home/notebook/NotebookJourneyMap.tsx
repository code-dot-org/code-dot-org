/**
 * NotebookJourneyMap — journey-map overview for the four-node Python
 * Notebook onboarding path.
 *
 * Mirrors the AI Decisions JourneyPath/LessonSection layout:
 *   - Sticky chrome with CDO logo, seat indicator, and title
 *   - Vertical winding path of four BubbleNode elements with sine-wave
 *     horizontal offsets
 *   - Node labels below each bubble
 *   - PulseRing on the current (frontier) node
 *
 * Tapping any non-locked bubble fires onNodeTap(nodeIndex).
 */

import {AppBar, Box, Toolbar, Typography, keyframes} from '@mui/material';

import {BubbleNode} from '@code-dot-org/component-library/bubbleNode';
import type {
  BubbleState,
  BubbleVariant,
} from '@code-dot-org/component-library/bubbleNode';

import CdoLogo from '@/config/brand/assets/cdo-logo-inverse.webp';
import type {SeatColorToken} from '@/modules/seats/types';

// ---------------------------------------------------------------------------
// Node manifest
// ---------------------------------------------------------------------------

/** Static metadata for each of the four onboarding nodes. */
const NODES: {title: string; variant: BubbleVariant}[] = [
  {title: 'Hello, Python!', variant: 'concept'},
  {title: 'Words and Code', variant: 'activity'},
  {title: 'The Dial', variant: 'activity'},
  {title: 'You Built Something', variant: 'capstone'},
];

/** 8-step sine offsets in px — same winding-river curve as AI Decisions. */
const PATH_OFFSETS = [0, 48, 72, 48, 0, -48, -72, -48];

/** Vertical gap between consecutive bubble centres, in px. */
const VERTICAL_SPACING = 32;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for NotebookJourneyMap. */
export interface NotebookJourneyMapProps {
  /**
   * Per-node completion flags (index-aligned with NODES).
   * Absent or shorter than NODES — missing entries treated as false.
   */
  nodes: boolean[];
  /** Active seat color for the seat indicator dot. */
  seatColor: SeatColorToken | null;
  /** Called with the zero-based node index when the learner taps a bubble. */
  onNodeTap: (nodeIndex: number) => void;
  /** Called when the learner taps the CDO logo — returns to /m/home. */
  onTapLogo: () => void;
  /** Called when the learner taps the seat indicator to switch seats. */
  onTapSeat: () => void;
}

// ---------------------------------------------------------------------------
// State derivation
// ---------------------------------------------------------------------------

/**
 * Derives BubbleState for one node given the full completion array.
 *
 * Frontier rule (Duolingo-style): only the first incomplete node is
 * 'current' (tappable with pulse). Completed nodes always re-tappable.
 * Nodes after the frontier are 'locked'.
 *
 * @param nodes Completion flags array
 * @param index Node index to derive state for
 * @returns BubbleState for the node
 */
function deriveNodeState(nodes: boolean[], index: number): BubbleState {
  if (nodes[index]) return 'completed';
  const frontier = nodes.findIndex(n => !n);
  if (frontier === -1 || index === frontier) return 'current';
  return 'locked';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Color values for the seat indicator dot. */
const SEAT_COLOR_MAP: Record<SeatColorToken, string> = {
  red: '#e53935',
  blue: '#1e88e5',
  green: '#43a047',
  yellow: '#fdd835',
};

/** Props for SeatDot. */
interface SeatDotProps {
  color: SeatColorToken;
  onTap: () => void;
}

/** Tappable colored dot representing the active seat. */
function SeatDot({color, onTap}: SeatDotProps): React.ReactElement {
  return (
    <Box
      component="button"
      onClick={onTap}
      aria-label="Switch seat"
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: SEAT_COLOR_MAP[color],
        border: '2px solid rgba(255,255,255,0.6)',
        flexShrink: 0,
        padding: 0,
        cursor: 'pointer',
        '&:hover': {borderColor: 'rgba(255,255,255,0.9)'},
      }}
    />
  );
}

/** Props for NotebookChrome. */
interface NotebookChromeProps {
  seatColor: SeatColorToken | null;
  onTapLogo: () => void;
  onTapSeat: () => void;
}

/** Sticky top bar: CDO logo, optional seat dot, journey title. */
function NotebookChrome({
  seatColor,
  onTapLogo,
  onTapSeat,
}: NotebookChromeProps): React.ReactElement {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{backgroundColor: 'primary.main'}}
    >
      <Toolbar sx={{minHeight: 56, gap: 1}}>
        <Box
          sx={{display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0}}
        >
          <Box
            component="button"
            onClick={onTapLogo}
            aria-label="Home"
            sx={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={CdoLogo}
              alt="Code.org"
              sx={{height: 28, width: 'auto', display: 'block'}}
            />
          </Box>
          {seatColor !== null && (
            <SeatDot color={seatColor} onTap={onTapSeat} />
          )}
        </Box>

        <Typography
          variant="subtitle1"
          component="h1"
          sx={{
            flex: 1,
            textAlign: 'center',
            color: 'primary.contrastText',
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Python Notebook Lab
        </Typography>

        {/* Right spacer to keep title visually centred. */}
        <Box sx={{width: 40, flexShrink: 0}} />
      </Toolbar>
    </AppBar>
  );
}

/** Keyframe for the pulse ring — same spec as AI Decisions PulseRing. */
const pulseKeyframes = keyframes`
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0;   }
`;

/** Animated halo rendered behind the current-node bubble. */
function PulseRing(): React.ReactElement {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '3px solid',
        borderColor: 'primary.light',
        animation: `${pulseKeyframes} 1.5s ease-out infinite`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/** Journey-map overview for the four Python Notebook onboarding nodes. */
export function NotebookJourneyMap({
  nodes,
  seatColor,
  onNodeTap,
  onTapLogo,
  onTapSeat,
}: NotebookJourneyMapProps): React.ReactElement {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <NotebookChrome
        seatColor={seatColor}
        onTapLogo={onTapLogo}
        onTapSeat={onTapSeat}
      />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          maxWidth: 480,
          width: '100%',
          marginX: 'auto',
        }}
      >
        {/* Section tint matching the notebook / data-science motif. */}
        <Box
          sx={{
            backgroundColor: '#c8e4f8',
            paddingTop: 4,
            paddingBottom: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${VERTICAL_SPACING}px`,
          }}
        >
          {NODES.map((node, idx) => {
            const state = deriveNodeState(nodes, idx);
            const offset = PATH_OFFSETS[idx % PATH_OFFSETS.length] ?? 0;
            const tappable = state !== 'locked';

            return (
              <Box
                key={node.title}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    transform: `translateX(${offset}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: tappable ? 'pointer' : 'default',
                  }}
                  onClick={tappable ? () => onNodeTap(idx) : undefined}
                >
                  <Box sx={{position: 'relative', display: 'inline-flex'}}>
                    {state === 'current' && <PulseRing />}
                    <BubbleNode
                      variant={node.variant}
                      state={state}
                      onTap={tappable ? () => onNodeTap(idx) : undefined}
                      ariaLabel={node.title}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={state === 'current' ? 700 : 400}
                    sx={{
                      color:
                        state === 'locked' ? 'text.disabled' : 'text.primary',
                      maxWidth: 120,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {node.title}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
