/**
 * JourneyChrome — top app bar for the journey map screen.
 *
 * Layout (FR-002d):
 *   [SeatIndicator]   [Unit title]   [LanguageToggle]
 *
 * The seat indicator is a small colored dot representing the active seat.
 * The title is the unit/journey title string from content.
 * The LanguageToggle calls onToggleLanguage which callers wire to setLanguage.
 */

import {AppBar, Box, Toolbar, Typography} from '@mui/material';

import CdoLogo from '@/config/brand/assets/cdo-logo-inverse.webp';

import {LanguageToggle} from '../i18n/LanguageToggle';
import type {Language, SeatColorToken} from '../seats/types';

export interface JourneyChromeSeatIndicatorProps {
  /** Color token for the active seat. */
  color: SeatColorToken;
}

export interface JourneyChomeProps {
  /** Journey/unit title displayed in the center. */
  title: string;
  /** Active seat for the color indicator, or null if none. */
  seatColor: SeatColorToken | null;
  /** Currently active language. */
  lang: Language;
  /** Called when the learner taps a language segment. */
  onToggleLanguage: (lang: Language) => void;
  /** Called when the learner taps the CDO logo — returns to /m/home. */
  onTapLogo?: () => void;
  /** Called when the learner taps the seat indicator — used to navigate
   * to the seat picker for seat-switching. */
  onTapSeat?: () => void;
}

/** Maps seat color tokens to MUI-compatible CSS color values. */
const SEAT_COLOR_MAP: Record<SeatColorToken, string> = {
  red: '#e53935',
  blue: '#1e88e5',
  green: '#43a047',
  yellow: '#fdd835',
};

/**
 * Seat color dot shown left of the title.  Tappable when `onTap` is
 * supplied — tapping navigates to the seat picker for seat-switching.
 */
function SeatIndicator({
  color,
  onTap,
}: JourneyChromeSeatIndicatorProps & {onTap?: () => void}) {
  return (
    <Box
      component={onTap ? 'button' : 'div'}
      onClick={onTap}
      aria-label={onTap ? 'Switch seat' : undefined}
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: SEAT_COLOR_MAP[color],
        border: '2px solid rgba(255,255,255,0.6)',
        flexShrink: 0,
        padding: 0,
        cursor: onTap ? 'pointer' : 'default',
        '&:hover': onTap ? {borderColor: 'rgba(255,255,255,0.9)'} : undefined,
      }}
    />
  );
}

/**
 * Top chrome bar for the journey map.
 * Renders inside a MUI AppBar to get safe-area-inset handling on iOS.
 */
export function JourneyChrome({
  title,
  seatColor,
  lang,
  onToggleLanguage,
  onTapLogo,
  onTapSeat,
}: JourneyChomeProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{backgroundColor: 'primary.main'}}
    >
      <Toolbar sx={{minHeight: 56, gap: 1}}>
        {/* Left cluster: CODE wordmark (replaces the studio header
         *  marketing nav we suppress on `/m/*`) and the seat indicator. */}
        <Box
          sx={{display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0}}
        >
          <Box
            component={onTapLogo ? 'button' : 'div'}
            onClick={onTapLogo}
            aria-label={onTapLogo ? 'Home' : undefined}
            sx={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: onTapLogo ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={CdoLogo}
              alt="Code.org"
              sx={{height: 28, width: 'auto', display: 'block'}}
            />
          </Box>
          {seatColor !== null && (
            <SeatIndicator color={seatColor} onTap={onTapSeat} />
          )}
        </Box>

        <Typography
          variant="subtitle1"
          component="h1"
          sx={{
            flex: 1,
            textAlign: 'center',
            color: 'primary.contrastText',
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>

        <Box sx={{width: 'auto', flexShrink: 0}}>
          <LanguageToggle lang={lang} onToggle={onToggleLanguage} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
