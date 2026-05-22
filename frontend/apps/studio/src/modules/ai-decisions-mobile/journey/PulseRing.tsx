/**
 * PulseRing — animated halo around the current-level bubble.
 *
 * CSS keyframes animate transform (scale) and opacity only — no layout
 * properties, no filter — to stay on the compositor thread (FR performance).
 * The ring is absolutely positioned and pointer-events: none so it never
 * intercepts taps.
 *
 * Cycle: 1.5 s loop, ease-out scale 1→1.5 + opacity 0.6→0.
 */

import {Box, keyframes} from '@mui/material';

/** Keyframe: scale out and fade over one cycle. */
const pulseKeyframes = keyframes`
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0;   }
`;

/** Absolutely-positioned pulse overlay for the current bubble. */
export function PulseRing() {
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
