/**
 * ConfettiBurst — full-screen CSS confetti celebration overlay.
 *
 * 20 coloured squares fall from the top of the screen via CSS keyframes.
 * Calls onDismiss after 2.5 s.  CSS transform/opacity only — 60fps budget.
 */

import {Box} from '@mui/material';
import {useEffect} from 'react';

const COLORS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#3f51b5',
  '#2196f3',
  '#4caf50',
  '#ff9800',
  '#ffeb3b',
];
const PIECE_COUNT = 20;

export interface ConfettiBurstProps {
  onDismiss: () => void;
}

/** CSS confetti overlay that auto-dismisses after 2.5 s. */
export function ConfettiBurst({onDismiss}: ConfettiBurstProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 2500);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <Box
      data-testid="confetti-burst"
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
      aria-hidden
    >
      {Array.from({length: PIECE_COUNT}, (_, i) => {
        const left = `${(i / PIECE_COUNT) * 100 + Math.sin(i * 1.3) * 3}%`;
        const delay = `${(i * 0.1) % 1}s`;
        const color = COLORS[i % COLORS.length];
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: '-20px',
              left,
              width: 10,
              height: 10,
              backgroundColor: color,
              borderRadius: i % 3 === 0 ? '50%' : 0,
              animation: `confettiFall 2.5s ${delay} ease-in infinite`,
              '@keyframes confettiFall': {
                '0%': {transform: 'translateY(-20px) rotate(0deg)', opacity: 1},
                '100%': {
                  transform: 'translateY(110vh) rotate(720deg)',
                  opacity: 1,
                },
              },
            }}
          />
        );
      })}
    </Box>
  );
}
