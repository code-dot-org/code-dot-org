/**
 * SectionBanner — journey-map section title with scroll-to-first-bubble action.
 *
 * Renders a full-width pill-shaped banner with a section title string.
 * Tapping the banner fires onTap, which callers use to scroll the journey
 * map to the first bubble in the section.
 *
 * Visual note: left-aligned title text, subtle background tint, 48dp height
 * for comfortable touch targets (FR-030).
 */

import {Box, Typography} from '@mui/material';
import {memo} from 'react';

export interface SectionBannerProps {
  /** Section title displayed inside the banner. */
  title: string;
  /** Called when the learner taps the banner to scroll to the first bubble. */
  onTap?: () => void;
  /** Accessible label (defaults to title). */
  ariaLabel?: string;
}

/** Minimum tap height in px per FR-030. */
const MIN_HEIGHT = 48;

/**
 * Section banner pill.  Designed to sit inline on the journey-map scroll
 * canvas between groups of BubbleNode elements.
 */
function SectionBannerComponent({title, onTap, ariaLabel}: SectionBannerProps) {
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={ariaLabel ?? title}
      onClick={onTap}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onTap?.();
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: MIN_HEIGHT,
        width: '100%',
        paddingX: 2,
        paddingY: 1,
        borderRadius: '24px',
        backgroundColor: 'primary.light',
        cursor: onTap ? 'pointer' : 'default',
        userSelect: 'none',
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'primary.dark',
          outlineOffset: 2,
        },
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: 'primary.contrastText',
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}

/** @see SectionBannerProps */
export const SectionBanner = memo(SectionBannerComponent);
export default SectionBanner;
