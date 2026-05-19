/**
 * MasteryDot — four-state mastery indicator for the mobile AI prototype.
 *
 * Mirrors the MasteryDot type (0–3) from data-model.md:
 *   0 = empty   — hollow circle, grey border
 *   1 = quarter — quarter-fill using clip-path, primary color
 *   2 = half    — half-fill, primary color
 *   3 = mastered — full fill + golden glow
 */

import {Box} from '@mui/material';
import {memo} from 'react';

/** Maps to the MasteryDot integer type in data-model.md (0–3). */
export type MasteryDotValue = 0 | 1 | 2 | 3;

export interface MasteryDotProps {
  /** Current mastery level (0=empty, 1=attempted, 2=practiced, 3=mastered). */
  value: MasteryDotValue;
  /** Diameter in px. Defaults to 16. */
  size?: number;
  /** Accessible label describing mastery state. */
  ariaLabel?: string;
}

/** Diameter used when no size prop is provided. */
const DEFAULT_SIZE = 16;

/** Returns fill fraction (0–1) for a mastery value. */
function getFillFraction(value: MasteryDotValue): number {
  if (value === 0) return 0;
  if (value === 1) return 0.25;
  if (value === 2) return 0.5;
  return 1;
}

/**
 * MasteryDot indicator.  Uses a layered Box approach: a grey background
 * circle with a primary-color fill Box clipped to the appropriate fraction.
 */
function MasteryDotComponent({
  value,
  size = DEFAULT_SIZE,
  ariaLabel,
}: MasteryDotProps) {
  const fill = getFillFraction(value);
  const isMastered = value === 3;

  return (
    <Box
      role="img"
      aria-label={ariaLabel}
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'grey.300',
        overflow: 'hidden',
        boxShadow: isMastered ? '0 0 6px 2px rgba(255, 200, 0, 0.7)' : 'none',
        flexShrink: 0,
      }}
    >
      {fill > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${fill * 100}%`,
            backgroundColor: isMastered ? 'warning.main' : 'primary.main',
          }}
        />
      )}
    </Box>
  );
}

/** @see MasteryDotProps */
export const MasteryDot = memo(MasteryDotComponent);
export default MasteryDot;
