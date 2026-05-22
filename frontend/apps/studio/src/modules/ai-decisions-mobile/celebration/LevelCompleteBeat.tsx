/**
 * LevelCompleteBeat — brief positive-feedback overlay between levels.
 *
 * Shown for ~1.2 s after any non-final level completes, before
 * advancing to the next renderer.  Without this, the kid solves a
 * level and the screen silently swaps to a new renderer — feels
 * broken.  Even a quick "Nice!" beat tells them their action mattered.
 *
 * The final level of a lesson skips this and goes straight to
 * `LessonCompleteCelebration` (the bigger 🎉 surface).
 */

import {Box, Typography} from '@mui/material';
import {useEffect} from 'react';

export interface LevelCompleteBeatProps {
  /** Language code for localised label. */
  lang: 'en' | 'hi';
  /** Called once the beat's display duration is up. */
  onDone: () => void;
  /** Override the auto-advance duration (default 1200 ms). */
  durationMs?: number;
}

/** One-beat "Nice!" overlay shown between levels of the same lesson. */
export function LevelCompleteBeat({
  lang,
  onDone,
  durationMs = 1200,
}: LevelCompleteBeatProps) {
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
        height: '100%',
        gap: 2,
      }}
    >
      <Box
        component="div"
        aria-hidden
        sx={{
          fontSize: '4.5rem',
          lineHeight: 1,
          animation: 'beatPop 0.5s ease-out',
          '@keyframes beatPop': {
            from: {transform: 'scale(0.4)', opacity: 0},
            '60%': {transform: 'scale(1.15)', opacity: 1},
            to: {transform: 'scale(1)', opacity: 1},
          },
        }}
      >
        ✅
      </Box>
      <Typography variant="h5" sx={{fontWeight: 700}}>
        {lang === 'hi' ? 'शाबाश!' : 'Nice!'}
      </Typography>
    </Box>
  );
}
