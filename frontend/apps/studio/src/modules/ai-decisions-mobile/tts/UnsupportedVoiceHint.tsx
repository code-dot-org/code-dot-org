/**
 * UnsupportedVoiceHint — unobtrusive indicator shown next to SpeakerAffordance
 * when the device has no TTS voice for the current language (FR-023).
 *
 * Never blocks the UX — it is informational only and does not disable
 * the speaker button or any lesson content.
 */

import {Box, Tooltip} from '@mui/material';

export interface UnsupportedVoiceHintProps {
  /** Language code for which the voice is missing. */
  lang: string;
}

const HINT_TEXT: Record<string, string> = {
  hi: 'Hindi voice not available on this device',
  en: 'English voice not available on this device',
};

/** Small warning indicator rendered inline next to the speaker button. */
export function UnsupportedVoiceHint({lang}: UnsupportedVoiceHintProps) {
  const message = HINT_TEXT[lang] ?? `Voice unavailable (${lang})`;

  return (
    <Tooltip title={message} placement="top">
      <Box
        component="span"
        aria-label={message}
        sx={{
          fontSize: '0.9rem',
          lineHeight: 1,
          color: 'warning.main',
          cursor: 'help',
        }}
      >
        ⚠️
      </Box>
    </Tooltip>
  );
}
