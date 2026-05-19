/**
 * ThinkingAnimation — "AI Bot is thinking" interstitial.
 *
 * Plays a pulsing robot icon for ~1.5 s then calls onDone.
 * CSS-only: no Lottie dependency for this prototype.
 */

import {Box, Typography} from '@mui/material';
import {useEffect} from 'react';

export interface ThinkingAnimationProps {
  /** Called after the animation completes. Default: 1500 ms. */
  onDone: () => void;
  /** Override duration in ms (useful in tests / demo environments). */
  durationMs?: number;
}

/** Pulsing AI bot animation shown between emoji pick and remix reveal. */
export function ThinkingAnimation({
  onDone,
  durationMs = 1500,
}: ThinkingAnimationProps) {
  useEffect(() => {
    const id = setTimeout(onDone, durationMs);
    return () => clearTimeout(id);
  }, [onDone, durationMs]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: '100%',
        minHeight: 200,
      }}
    >
      <Box
        sx={{
          fontSize: '4rem',
          animation: 'aiPulse 0.75s ease-in-out infinite alternate',
          '@keyframes aiPulse': {
            from: {transform: 'scale(1)', opacity: 0.7},
            to: {transform: 'scale(1.2)', opacity: 1},
          },
        }}
        aria-hidden
      >
        🤖
      </Box>
      <Typography variant="h6" textAlign="center">
        AI is thinking…
      </Typography>
    </Box>
  );
}
