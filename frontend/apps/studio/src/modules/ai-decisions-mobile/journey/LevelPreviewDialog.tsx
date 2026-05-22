/**
 * LevelPreviewDialog — small flyout shown when a learner taps a journey bubble.
 *
 * Implemented as an MUI `Popover` anchored to the tapped bubble so it
 * reads as a peek-out card, not a full-screen modal.  A small arrow on
 * the popover edge points back at the source bubble.
 *
 * Caller (JourneyBubble) owns open/close state AND supplies the anchor
 * element (the bubble's DOM node).  The component itself is stateless.
 */

import {Box, Button, Popover, Typography} from '@mui/material';

import type {BubbleState} from '@code-dot-org/component-library/bubbleNode';

import type {Level} from '../content/types';

/**
 * Label for the primary action button.  Varies by bubble state so the
 * affordance is honest about whether this is a fresh start, a resume,
 * or a replay.
 */
function actionLabelForState(state: BubbleState, lang: 'en' | 'hi'): string {
  if (lang === 'hi') {
    switch (state) {
      case 'completed':
      case 'mastered':
        return 'फिर से';
      case 'current':
        return 'जारी';
      default:
        return 'शुरू';
    }
  }
  switch (state) {
    case 'completed':
    case 'mastered':
      return 'Replay';
    case 'current':
      return 'Continue';
    default:
      return 'Start';
  }
}

/** Short, K-5-readable description of what the learner will do on this level. */
function descriptionForKind(kind: Level['kind'], lang: 'en' | 'hi'): string {
  const enMap: Record<Level['kind'], string> = {
    multi: 'Pick the best answer.',
    match: 'Sort the items into the right boxes.',
    reading: 'Read along with the AI Bot.',
    video: 'Watch a short video.',
    'dance-intro-video': 'Watch the dance intro.',
    'oceans-video': 'Watch how AI learns.',
    'oceans-labeling': 'Help train the AI by labeling.',
    'dance-emoji-pick': 'Pick emoji, the AI makes a remix.',
    'bubble-choice': 'Pick a way to share what you learned.',
    survey: 'Answer a few quick questions.',
  };
  const hiMap: Record<Level['kind'], string> = {
    multi: 'सबसे अच्छा उत्तर चुनें।',
    match: 'चीज़ों को सही बॉक्स में डालें।',
    reading: 'AI बॉट के साथ पढ़ें।',
    video: 'एक छोटा वीडियो देखें।',
    'dance-intro-video': 'डांस वीडियो देखें।',
    'oceans-video': 'देखें कि AI कैसे सीखता है।',
    'oceans-labeling': 'AI को सिखाने में मदद करें।',
    'dance-emoji-pick': 'इमोजी चुनें, AI मिक्स बनाएगा।',
    'bubble-choice': 'अपनी सीख साझा करने का तरीका चुनें।',
    survey: 'कुछ छोटे सवालों के जवाब दें।',
  };
  return (lang === 'hi' ? hiMap[kind] : enMap[kind]) ?? '';
}

export interface LevelPreviewDialogProps {
  /** Whether the popover is open. */
  open: boolean;
  /** The bubble's DOM element — the popover anchors to it. */
  anchorEl: HTMLElement | null;
  /** The level to preview. */
  level: Level;
  /** Bubble state — drives the action label. */
  state: BubbleState;
  /** Active language for localized strings. */
  lang: 'en' | 'hi';
  /** Called when the learner confirms — caller should navigate into the lesson. */
  onStart: () => void;
  /** Called when the learner dismisses without entering. */
  onClose: () => void;
}

/** Flyout describing a journey level before entry. */
export function LevelPreviewDialog({
  open,
  anchorEl,
  level,
  state,
  lang,
  onStart,
  onClose,
}: LevelPreviewDialogProps) {
  const title = lang === 'hi' ? level.title.hi : level.title.en;
  const isLocked = state === 'locked';
  const description = isLocked
    ? lang === 'hi'
      ? 'पहले पिछला पाठ पूरा करो।'
      : 'Finish the previous level first.'
    : descriptionForKind(level.kind, lang);
  const actionLabel = actionLabelForState(state, lang);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      transformOrigin={{vertical: 'top', horizontal: 'center'}}
      // disableScrollLock: Popover (extends Modal) by default locks the body
      // scroll and adds `padding-right: <scrollbar-width>` to compensate for
      // the disappearing scrollbar.  On the journey screen there is no
      // body-level scrollbar (we scroll an inner container), so the padding
      // shows as a visible blank gutter on the right.  Disable the lock.
      disableScrollLock
      slotProps={{
        // Backdrop click → close.  MUI's built-in onClose is supposed to
        // fire here but in this app's setup (portal + nested onClick on
        // JourneyBubble wrapper) it intermittently misses; wiring it
        // explicitly guarantees outside-click dismiss.
        backdrop: {
          onClick: () => onClose(),
        },
        paper: {
          sx: {
            // Compact flyout — half the bubble width on each side.
            maxWidth: 240,
            padding: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            marginTop: '6px',
          },
          // Stop click propagation so taps inside the paper don't bubble
          // through React's portal tree back to the bubble wrapper, which
          // would interpret it as "open this bubble's popover" (recursive).
          onClick: (e: React.MouseEvent<HTMLElement>) => e.stopPropagation(),
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          textAlign: 'center',
        }}
      >
        <Typography variant="subtitle1" sx={{fontWeight: 700, lineHeight: 1.2}}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{lineHeight: 1.3}}
        >
          {description}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
            marginTop: 0.5,
          }}
        >
          {isLocked ? (
            // Locked: only OK (= dismiss) — there's no entry action.
            <Button
              size="small"
              variant="contained"
              onClick={onClose}
              data-testid="level-preview-cancel"
            >
              {lang === 'hi' ? 'ठीक है' : 'OK'}
            </Button>
          ) : (
            // Unlocked: only the primary CTA.  Outside-click dismisses.
            <Button
              size="small"
              variant="contained"
              onClick={onStart}
              data-testid="level-preview-start"
              sx={{minWidth: 80}}
            >
              {actionLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Popover>
  );
}
