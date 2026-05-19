/**
 * AnticipationCue — soft fish-silhouette gradient layered behind the
 * bottom of lesson 1's bubble section (T027).
 *
 * Purely decorative — pointer-events: none, aria-hidden.  The gradient
 * transitions from transparent at the top to a subtle ocean-blue tint at
 * the bottom, hinting at the AI for Oceans content in lesson 2.
 *
 * Positioned absolutely relative to the lesson container so it bleeds
 * into the bottom of the section without affecting layout.
 */

import {Box} from '@mui/material';

/**
 * Decorative fish-silhouette gradient overlay.
 * Renders a simple fish outline SVG at low opacity over a blue gradient.
 */
export function AnticipationCue() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        background:
          'linear-gradient(to bottom, transparent 0%, rgba(13, 71, 161, 0.08) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 1,
        overflow: 'hidden',
      }}
    >
      {/* Fish silhouette SVG — subtle, low-opacity outline */}
      <Box
        component="svg"
        viewBox="0 0 80 40"
        sx={{width: 80, height: 40, opacity: 0.12, fill: '#1565c0'}}
      >
        {/* Body ellipse */}
        <ellipse cx="40" cy="20" rx="28" ry="14" />
        {/* Tail fin */}
        <polygon points="68,20 80,8 80,32" />
        {/* Eye */}
        <circle cx="18" cy="18" r="3" fill="white" />
      </Box>
    </Box>
  );
}
