/**
 * RemixOutput — displays the AI's canned remix result after emoji pick.
 *
 * Shows a palette of the selected emoji and a "your AI remix!" message.
 * The "Continue" button triggers the confetti sequence.
 */

import {Box, Button, Typography} from '@mui/material';

export interface RemixOutputProps {
  /** The three emoji chosen by the learner. */
  picks: string[];
  onContinue: () => void;
}

/** Remix result card shown between thinking animation and confetti. */
export function RemixOutput({picks, onContinue}: RemixOutputProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5">Your AI Remix!</Typography>
      <Box sx={{display: 'flex', gap: 2, fontSize: '3rem'}}>
        {picks.map((emoji, i) => (
          <Box key={i} aria-label={emoji}>
            {emoji}
          </Box>
        ))}
      </Box>
      <Typography variant="body1" color="text.secondary">
        The AI combined your choices to create a unique dance remix!
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={onContinue}
        sx={{minWidth: 160}}
      >
        Celebrate!
      </Button>
    </Box>
  );
}
