/**
 * LessonSection — one lesson section on the journey map.
 *
 * Renders a tinted background region (full-bleed; no rounded card frame)
 * containing:
 *   1. A SectionBanner at the top.
 *   2. The lesson's bubbles laid out as a single-column vertical *path*,
 *      with each bubble horizontally offset along an 8-step sine cycle.
 *      Between consecutive bubbles, three small grey "footprint" dots
 *      hint at the path direction.
 *
 * The path metaphor (Duolingo-style) replaced the prior 3-column grid
 * with reversed-odd-rows S-curve, which read as a waffle, not a trail.
 *
 * The `sectionTint` design-system token drives the background color.
 */

import {Box} from '@mui/material';
import {useRef} from 'react';

import {SectionBanner} from '@code-dot-org/component-library/sectionBanner';

import type {Lesson} from '../content/types';
import type {JourneyProgress} from '../seats/types';

import {JourneyBubble} from './JourneyBubble';

export interface LessonSectionProps {
  lesson: Lesson;
  /** Active language code for localised names. */
  lang: 'en' | 'hi';
  /** Journey progress for bubble state derivation. */
  progress: JourneyProgress | null;
  /** Level IDs that are on the unlock frontier (tappable but not done). */
  frontier: Set<string>;
  /** Called when learner taps a bubble. */
  onBubbleTap: (levelId: string) => void;
}

/** Maps sectionTint tokens to MUI sx bgcolor values.  Saturation bumped
 * up from the prior near-white pastels so sections differentiate at arm's
 * length under classroom lighting (UX agent feedback). */
const TINT_MAP: Record<string, string> = {
  'neutral.sand': '#f0e6d2',
  'blue.light': '#c8e4f8',
  'purple.light': '#e1bee7',
  'green.light': '#c8e6c9',
  'orange.light': '#ffe0b2',
};

/** Returns a CSS background color for a sectionTint token. */
function tintColor(token: string): string {
  return TINT_MAP[token] ?? '#e0e0e0';
}

/**
 * 8-step sine offsets in dp from center.  A gentler curve than a
 * sawtooth alternation — reads as a winding river.
 */
const PATH_OFFSETS = [0, 48, 72, 48, 0, -48, -72, -48];

/** Vertical spacing between successive bubble centers, in dp. */
const VERTICAL_SPACING = 24;

/**
 * Journey-map section for one lesson.
 * The SectionBanner scroll-to handler uses the container ref.
 */
export function LessonSection({
  lesson,
  lang,
  progress,
  frontier,
  onBubbleTap,
}: LessonSectionProps) {
  const firstBubbleRef = useRef<HTMLDivElement | null>(null);

  /** Scroll-to-first-bubble handler wired to the SectionBanner. */
  function handleBannerTap() {
    firstBubbleRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  return (
    <Box
      sx={{
        backgroundColor: tintColor(lesson.sectionTint),
        paddingTop: 3,
        paddingBottom: 4,
        // Full-bleed: no horizontal padding or rounded corners — tint
        // serves as the wallpaper for the section, not a card frame.
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <SectionBanner
        title={lang === 'hi' ? lesson.name.hi : lesson.name.en}
        onTap={handleBannerTap}
      />

      {/* Vertical path — single column of bubbles with sine-wave offsets. */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${VERTICAL_SPACING}px`,
          paddingTop: 1,
        }}
      >
        {lesson.levels.map((level, idx) => {
          const offset = PATH_OFFSETS[idx % PATH_OFFSETS.length] ?? 0;
          return (
            <Box
              key={level.id}
              ref={idx === 0 ? firstBubbleRef : undefined}
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
                  transition: 'transform 0.2s',
                }}
              >
                <JourneyBubble
                  level={level}
                  progress={progress}
                  isFrontier={frontier.has(level.id)}
                  onTap={onBubbleTap}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
