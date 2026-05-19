/**
 * SpeakerAffordance — tap-to-speak icon button.
 *
 * ≥56dp touch target (FR-030).  Single tap: speak.
 * Double-tap while speaking: cancel + restart (FR-022).
 * Optionally renders UnsupportedVoiceHint when the voice is unavailable.
 */

import {Box, IconButton} from '@mui/material';
import {useCallback, useEffect, useRef, useState} from 'react';

import {useLanguage} from '../i18n/StringsProvider';

import {speak, stop, isSupported} from './tts';
import {UnsupportedVoiceHint} from './UnsupportedVoiceHint';

export interface SpeakerAffordanceProps {
  /** Text to speak when tapped. */
  text: string;
  /** Accessible label for the button. */
  ariaLabel?: string;
}

/** Speaker icon as a unicode character — avoids @mui/icons-material dep. */
const SPEAKER_ICON = '🔊';

/**
 * Tap-to-speak button.  Tracks speaking state for double-tap restart and
 * checks voice availability for the UnsupportedVoiceHint.
 */
export function SpeakerAffordance({
  text,
  ariaLabel = 'Read aloud',
}: SpeakerAffordanceProps) {
  const lang = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    void isSupported(lang).then(supported => {
      if (!cancelled) setVoiceAvailable(supported);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const handleTap = useCallback(async () => {
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 400;
    lastTapRef.current = now;

    if (isDoubleTap && speaking) {
      await stop();
      setSpeaking(false);
      // Restart immediately.
      setSpeaking(true);
      await speak(text, lang);
      setSpeaking(false);
      return;
    }

    if (speaking) return;

    setSpeaking(true);
    try {
      await speak(text, lang);
    } finally {
      setSpeaking(false);
    }
  }, [speaking, text, lang]);

  return (
    <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.5}}>
      <IconButton
        aria-label={ariaLabel}
        aria-pressed={speaking}
        onClick={() => void handleTap()}
        size="small"
        sx={{
          minWidth: 56,
          minHeight: 56,
          fontSize: '1.25rem',
          opacity: speaking ? 0.6 : 1,
        }}
      >
        <Box component="span" aria-hidden sx={{lineHeight: 1}}>
          {SPEAKER_ICON}
        </Box>
      </IconButton>
      {!voiceAvailable && <UnsupportedVoiceHint lang={lang} />}
    </Box>
  );
}
