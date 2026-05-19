/**
 * LessonCompleteCelebration — brief congratulation shown between the
 * last level of a lesson and the return to the journey map.
 *
 * Minimal 1-beat version of the Khan-agent's 3-beat proposal:
 *   1. "You did it!" + lesson name + 🎉
 *   2. (future) "Look what you learned" + mastery claim
 *   3. (future) MasteryDot fill animation
 *
 * Caller renders this overlay; tapping Continue → navigates to journey.
 * No auto-dismiss timer — the learner controls advancement (FR-016
 * input debounce is satisfied because the only affordance is the
 * Continue button itself).
 */

import {Box, Button, Typography} from '@mui/material';

export interface LessonCompleteCelebrationProps {
  /** Lesson name in the active language. */
  lessonName: string;
  /** Language code — drives Continue label localisation. */
  lang: 'en' | 'hi';
  /** Called when the learner taps Continue. */
  onContinue: () => void;
}

/** Full-bleed congratulation card shown after lesson completion. */
export function LessonCompleteCelebration({
  lessonName,
  lang,
  onContinue,
}: LessonCompleteCelebrationProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 4,
        gap: 3,
        textAlign: 'center',
      }}
    >
      <Typography
        component="div"
        aria-hidden
        sx={{
          fontSize: '5rem',
          lineHeight: 1,
          animation: 'celebPop 0.6s ease-out',
          '@keyframes celebPop': {
            from: {transform: 'scale(0)', opacity: 0},
            to: {transform: 'scale(1)', opacity: 1},
          },
        }}
      >
        🎉
      </Typography>
      <Typography variant="h4" component="h1" sx={{fontWeight: 700}}>
        {lang === 'hi' ? 'तुमने कर दिखाया!' : 'You did it!'}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {lessonName}
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={onContinue}
        data-testid="lesson-complete-continue"
        sx={{minWidth: 180, marginTop: 2}}
      >
        {lang === 'hi' ? 'जारी रखें' : 'Continue'}
      </Button>
    </Box>
  );
}
