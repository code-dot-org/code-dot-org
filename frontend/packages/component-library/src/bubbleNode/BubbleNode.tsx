/**
 * BubbleNode — journey map bubble for the mobile AI prototype.
 *
 * Renders a single level bubble on the journey path.  Four shape variants
 * correspond to the four Level.variant values in data-model.md.
 *
 * Visual states:
 *   locked     — dimmed (30% saturation), grey glyph.  No padlock icon
 *                (deliberate per FR-002 and UX panel feedback).
 *   current    — full color with a pulse ring driven by the parent.
 *   completed  — full color.
 *   mastered   — full color + mastery glow effect.
 */

import {Box} from '@mui/material';
import {type ReactNode, memo} from 'react';

export type BubbleVariant = 'concept' | 'activity' | 'headline' | 'capstone';
export type BubbleState = 'locked' | 'current' | 'completed' | 'mastered';

export interface BubbleNodeProps {
  /** Shape and size variant. */
  variant: BubbleVariant;
  /** Learner's current progress state for this bubble. */
  state: BubbleState;
  /** Icon or image to render inside the bubble (optional). */
  glyph?: ReactNode;
  /** Called when the learner taps the bubble. */
  onTap?: () => void;
  /** Accessible label for the bubble (required for SR users). */
  ariaLabel?: string;
}

/** Base size for activity and concept bubbles, in dp. */
const BASE_SIZE = 64;
/** Headline bubbles are 1.4× the base size per FR-002. */
const HEADLINE_SIZE = Math.round(BASE_SIZE * 1.4);
/** Capstone bubbles are 1.2× base size. */
const CAPSTONE_SIZE = Math.round(BASE_SIZE * 1.2);

function getBubbleSize(variant: BubbleVariant): number {
  if (variant === 'headline') return HEADLINE_SIZE;
  if (variant === 'capstone') return CAPSTONE_SIZE;
  return BASE_SIZE;
}

/** Returns a CSS border-radius for the variant shape. */
function getBorderRadius(variant: BubbleVariant): string {
  if (variant === 'concept') return '8px'; // Diamond-ish square
  if (variant === 'headline') return '50%'; // Circle (larger)
  if (variant === 'capstone') return '50%'; // Circle with trophy
  return '50%'; // activity: circle
}

/** Returns the CSS transform for the concept diamond rotation. */
function getTransform(variant: BubbleVariant): string {
  return variant === 'concept' ? 'rotate(45deg)' : 'none';
}

/** Opacity applied to locked bubbles (30% saturation via filter). */
const LOCKED_FILTER = 'saturate(0.3)';

/**
 * Journey map bubble.  Renders the appropriate shape for the level's
 * variant and reflects the learner's progress state visually.
 */
function BubbleNodeComponent({
  variant,
  state,
  glyph,
  onTap,
  ariaLabel,
}: BubbleNodeProps) {
  const size = getBubbleSize(variant);
  const isLocked = state === 'locked';
  const isMastered = state === 'mastered';

  return (
    <Box
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={isLocked}
      onClick={isLocked ? undefined : onTap}
      onKeyDown={e => {
        if (!isLocked && (e.key === 'Enter' || e.key === ' ')) onTap?.();
      }}
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: getBorderRadius(variant),
        transform: getTransform(variant),
        backgroundColor: isLocked ? 'grey.400' : 'primary.main',
        filter: isLocked ? LOCKED_FILTER : 'none',
        boxShadow: isMastered
          ? '0 0 12px 4px rgba(255, 200, 0, 0.6)'
          : '0 2px 6px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLocked ? 'default' : 'pointer',
        // Minimum 56dp tap target per FR-030
        minWidth: 56,
        minHeight: 56,
        userSelect: 'none',
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'primary.dark',
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          // Counter-rotate glyph so concept diamond's content stays upright.
          transform:
            getTransform(variant) !== 'none' ? 'rotate(-45deg)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLocked ? 'grey.600' : 'primary.contrastText',
          fontSize: size * 0.4,
        }}
      >
        {glyph}
      </Box>
    </Box>
  );
}

/** @see BubbleNodeProps */
export const BubbleNode = memo(BubbleNodeComponent);
export default BubbleNode;
