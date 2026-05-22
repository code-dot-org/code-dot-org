/**
 * ReadingRenderer — informational reading card level renderer.
 *
 * Displays a title and body text from string keys.  A "Continue" button
 * fires onComplete(perfect=true) since reading levels have no wrong answer.
 *
 * Auto-plays TTS on first entry (FR-021): checks `autoPlayedAt` in
 * level state; if absent, speaks the body text once and writes the timestamp.
 * SpeakerAffordance is always available for manual re-reads.
 */

import {Box, Button, Typography} from '@mui/material';
import {useEffect} from 'react';

import type {Level} from '../../content/types';
import {useString, useLanguage} from '../../i18n/StringsProvider';
import {SpeakerAffordance} from '../../tts/SpeakerAffordance';
import {speak} from '../../tts/tts';

interface ReadingPayload {
  titleKey?: string;
  bodyKey: string;
}

export interface ReadingRendererProps {
  level: Level;
  onComplete: (perfect: boolean) => void;
}

/** Reading card renderer for `kind: 'reading'` levels. */
export function ReadingRenderer({level, onComplete}: ReadingRendererProps) {
  const getString = useString;
  const lang = useLanguage();
  const payload = level.payload as ReadingPayload;
  const bodyText = getString(payload.bodyKey);

  // Auto-play on first entry.  The sessionStorage ledger keyed by
  // `autoPlayed:<level.id>` means the speak() call only fires once per
  // browser session per level — so even though bodyText/lang/speak are
  // in the dep list, replays of the same level are a cheap no-op.
  const autoPlayKey = `autoPlayed:${level.id}`;
  useEffect(() => {
    if (sessionStorage.getItem(autoPlayKey)) return;
    sessionStorage.setItem(autoPlayKey, '1');
    void speak(bodyText, lang);
  }, [autoPlayKey, bodyText, lang]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
      {payload.titleKey && (
        <Typography variant="h6" component="p">
          {getString(payload.titleKey)}
        </Typography>
      )}
      <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
        <Typography variant="body1" sx={{flex: 1}}>
          {bodyText}
        </Typography>
        <SpeakerAffordance text={bodyText} ariaLabel="Read body text aloud" />
      </Box>
      <Button variant="contained" onClick={() => onComplete(true)}>
        Continue
      </Button>
    </Box>
  );
}
