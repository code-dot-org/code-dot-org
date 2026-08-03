import {Box} from '@mui/material';
import {useSearch} from '@tanstack/react-router';

import {useLevelProperties} from '@code-dot-org/lab/contexts';
import OceansLab from '@code-dot-org/oceans-lab';
import '@code-dot-org/oceans-lab/styles.css';

import type {LabEntrypointProps} from '@/modules/labs/router/getLabEntrypointByAppName';

/**
 * Studio entry point for the AI for Oceans lab.
 *
 * Wraps OceansLab in a CSS-only responsive shell that mirrors the FishView
 * curriculum-path layout: 16:9 box, clamped between 320 px and 1280 px,
 * proportional base font size. The sizing rules live in oceans-lab's CSS.
 *
 * The per-level `mode` (fishvtrash, creaturesvtrash, ...) is read from the
 * level properties, which carry it once `fish` is registered as a level kind
 * (see `levelKinds.ts`).
 */
export default function OceansContainer({onContinue}: LabEntrypointProps) {
  // `mode`/`guides` are fish-kind fields (see levelKinds.ts) that the base
  // properties type doesn't model; useLevelProperties returns them as unknown,
  // so narrow to string.
  const props = useLevelProperties();
  const appMode =
    typeof props?.mode === 'string'
      ? (props.mode as Parameters<typeof OceansLab>[0]['appMode'])
      : undefined;
  const guides = typeof props?.guides === 'string' ? props.guides : undefined;
  // Text-to-speech locale comes from the URL, not the level.
  const search = useSearch({strict: false});
  const textToSpeechLocale =
    typeof search.tts === 'string' ? search.tts : undefined;

  return (
    <Box className="oceans-lab-shell">
      <Box className="oceans-lab-frame">
        <OceansLab
          appMode={appMode}
          guides={guides}
          textToSpeechLocale={textToSpeechLocale}
          onContinue={onContinue}
        />
      </Box>
    </Box>
  );
}
