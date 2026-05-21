/**
 * JourneyTile — full-bleed row tile for a single journey on the home picker.
 *
 * Shows title, description, a state chip (Start / Continue / Done),
 * and an optional grade-band chip.  Tapping navigates to the journey.
 */

import {Box, Button, Chip, Typography} from '@mui/material';

import type {GradeBand, JourneyState} from './journeys/types';

/** Props for a single journey tile. */
export interface JourneyTileProps {
  /** Journey title. */
  title: string;
  /** Short description. */
  description: string;
  /** Progress state determining the CTA label. */
  state: JourneyState;
  /** Optional grade-band label. */
  gradeBand?: GradeBand;
  /** Called when the tile is tapped. */
  onTap: () => void;
}

/** Maps journey state to a human-readable CTA label. */
const STATE_LABEL: Record<JourneyState, string> = {
  start: 'Start',
  continue: 'Continue',
  done: 'Done ✓',
};

/** Maps journey state to a MUI Button color. */
const STATE_COLOR: Record<JourneyState, 'primary' | 'success'> = {
  start: 'primary',
  continue: 'primary',
  done: 'success',
};

/** Full-bleed journey tile for the home picker screen. */
export function JourneyTile({
  title,
  description,
  state,
  gradeBand,
  onTap,
}: JourneyTileProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        cursor: 'pointer',
        '&:hover': {backgroundColor: 'action.hover'},
      }}
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onTap();
      }}
      data-testid={`journey-tile-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Title + description */}
      <Box sx={{flex: 1, minWidth: 0}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {title}
          </Typography>
          {gradeBand !== undefined && (
            <Chip label={gradeBand} size="small" variant="outlined" />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {description}
        </Typography>
      </Box>

      {/* State CTA */}
      <Button
        variant={state === 'done' ? 'outlined' : 'contained'}
        color={STATE_COLOR[state]}
        size="small"
        onClick={e => {
          e.stopPropagation();
          onTap();
        }}
        tabIndex={-1}
        aria-hidden
        sx={{flexShrink: 0}}
      >
        {STATE_LABEL[state]}
      </Button>
    </Box>
  );
}
