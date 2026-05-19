/**
 * UnitCompleteCelebration — bigger celebration shown after the LAST
 * lesson of the unit completes.  Distinguishes "you finished a lesson"
 * (per-lesson 🎉) from "you finished the whole unit" (🏆 + congrats).
 *
 * Caller renders this overlay; tapping Continue → navigates back to
 * journey.  No auto-dismiss.
 */

import {Box, Button, Typography} from '@mui/material';

export interface UnitCompleteCelebrationProps {
  /** Unit name in the active language. */
  unitName: string;
  /** Language code. */
  lang: 'en' | 'hi';
  /** Called when the learner taps Continue. */
  onContinue: () => void;
}

/** Full-screen congratulation for unit completion. */
export function UnitCompleteCelebration({
  unitName,
  lang,
  onContinue,
}: UnitCompleteCelebrationProps) {
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
        background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
      }}
    >
      <Typography
        component="div"
        aria-hidden
        sx={{
          fontSize: '6rem',
          lineHeight: 1,
          animation: 'unitPop 0.7s ease-out',
          '@keyframes unitPop': {
            from: {transform: 'scale(0) rotate(-15deg)', opacity: 0},
            '60%': {transform: 'scale(1.2) rotate(8deg)', opacity: 1},
            to: {transform: 'scale(1) rotate(0deg)', opacity: 1},
          },
        }}
      >
        🏆
      </Typography>
      <Typography
        variant="h3"
        component="h1"
        sx={{fontWeight: 800, color: '#92400e'}}
      >
        {lang === 'hi' ? 'तुम चैम्पियन हो!' : 'You’re a champion!'}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {lang === 'hi' ? 'पूरी यूनिट पूरी की!' : 'Whole unit complete!'}
      </Typography>
      <Typography variant="body1" sx={{maxWidth: 280}}>
        {unitName}
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={onContinue}
        data-testid="unit-complete-continue"
        sx={{minWidth: 220, marginTop: 2, fontWeight: 700}}
      >
        {lang === 'hi' ? 'जारी रखें' : 'Continue'}
      </Button>
    </Box>
  );
}
