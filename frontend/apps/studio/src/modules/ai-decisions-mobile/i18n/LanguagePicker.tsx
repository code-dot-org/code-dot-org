/**
 * LanguagePicker — wordless first-launch language selection overlay.
 *
 * Shown on the seat picker when no language has been chosen yet.
 * Two large pills: one with "English" in English, one with "हिन्दी" in
 * Devanagari.  No other text — fully language-agnostic (FR-016).
 *
 * Tapping a pill:
 *   1. Speaks the language name via on-device TTS (FR-017)
 *   2. Calls onSelect with the chosen Language
 *
 * The caller (SeatsPage) handles seat creation and routing to /m/journey.
 */

import {Box, ButtonBase, Typography} from '@mui/material';

import type {Language} from '../seats/types';
import {speak} from '../tts/useTts';

export interface LanguagePickerProps {
  /** Called when the learner picks a language. */
  onSelect: (lang: Language) => void;
}

interface LangOption {
  code: Language;
  label: string;
  locale: string;
}

const LANG_OPTIONS: LangOption[] = [
  {code: 'en', label: 'English', locale: 'en-US'},
  {code: 'hi', label: 'हिन्दी', locale: 'hi-IN'},
];

/** Full-screen language picker overlay. */
export function LanguagePicker({onSelect}: LanguagePickerProps) {
  async function handlePick(option: LangOption) {
    await speak(option.label, option.locale);
    onSelect(option.code);
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        padding: 4,
        zIndex: 1300,
      }}
    >
      {LANG_OPTIONS.map(option => (
        <ButtonBase
          key={option.code}
          aria-label={option.label}
          onClick={() => void handlePick(option)}
          sx={{
            width: '100%',
            maxWidth: 280,
            height: 72,
            borderRadius: '36px',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:focus-visible': {
              outline: '3px solid',
              outlineColor: 'primary.dark',
              outlineOffset: 2,
            },
          }}
        >
          <Typography
            variant="h5"
            component="span"
            sx={{color: 'primary.contrastText', fontWeight: 700}}
          >
            {option.label}
          </Typography>
        </ButtonBase>
      ))}
    </Box>
  );
}
