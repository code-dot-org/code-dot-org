/**
 * LanguageToggle — EN / हिं pill switcher for the mobile prototype.
 *
 * Renders a two-segment pill button in the top-right chrome position.
 * Tapping a segment fires setLanguage on the active seat.  The flip
 * completes in ≤1s (Preferences write is async; the optimistic UI update
 * is immediate so the perceived delay is imperceptible).
 *
 * Route and scroll position are preserved: this component has no router
 * knowledge; it only mutates language on the active seat.  Callers
 * re-render the subtree because StringsProvider observes the language prop.
 */

import {Box, ButtonBase} from '@mui/material';

import type {Language} from '../seats/types';

export interface LanguageToggleProps {
  /** Currently active language. */
  lang: Language;
  /** Called with the new language when the learner taps a segment. */
  onToggle: (lang: Language) => void;
}

/** Map from language code to display label. */
const LABELS: Record<Language, string> = {
  en: 'EN',
  hi: 'अ',
};

const LANGUAGES: Language[] = ['en', 'hi'];

/**
 * Language selector pill.  Renders as an inline flex container with two
 * tappable segments; the active segment uses a filled background.
 */
export function LanguageToggle({lang, onToggle}: LanguageToggleProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '2px solid',
        borderColor: 'rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(255,255,255,0.12)',
        height: 36,
      }}
    >
      {LANGUAGES.map(code => (
        <ButtonBase
          key={code}
          aria-label={
            code === 'en' ? 'Switch to English' : 'हिंदी पर स्विच करें'
          }
          aria-pressed={lang === code}
          onClick={() => onToggle(code)}
          sx={{
            minWidth: 40,
            paddingX: 1.5,
            fontSize: '0.95rem',
            fontWeight: 700,
            backgroundColor: lang === code ? 'common.white' : 'transparent',
            color: lang === code ? 'primary.main' : 'common.white',
            transition: 'background-color 0.15s ease, color 0.15s ease',
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'common.white',
              outlineOffset: -2,
            },
          }}
        >
          {LABELS[code]}
        </ButtonBase>
      ))}
    </Box>
  );
}
