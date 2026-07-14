import {Box} from '@mui/material';

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
  // `mode`/`guides` are fish-kind fields (see levelKinds.ts) absent from the
  // base properties type, so read them as untrusted values and narrow.
  const props = useLevelProperties() as Record<string, unknown> | undefined;
  const appMode =
    typeof props?.mode === 'string'
      ? (props.mode as Parameters<typeof OceansLab>[0]['appMode'])
      : undefined;
  const guides = typeof props?.guides === 'string' ? props.guides : undefined;

  return (
    <Box className="oceans-lab-shell">
      <Box className="oceans-lab-frame">
        <OceansLab appMode={appMode} guides={guides} onContinue={onContinue} />
      </Box>
    </Box>
  );
}
