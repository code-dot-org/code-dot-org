import {Box} from '@mui/material';
import {useCallback, useEffect, useState} from 'react';

import OceansLab from '@code-dot-org/oceans-lab';
import '@code-dot-org/oceans-lab/styles.css';

import type {LabEntryProps} from '@/modules/labs/router/getLabEntrypoint';
import {courseProgressKey, get, set} from '@/modules/storage/idb';

const SLUG = 'ai-for-oceans';

/**
 * Studio entry point for the AI for Oceans lab.
 *
 * Wraps OceansLab in a CSS-only responsive shell that mirrors the FishView
 * curriculum-path layout: 16:9 box, clamped between 320 px and 1280 px,
 * proportional base font size.  The sizing rules live in oceans-lab's CSS;
 * vite library mode emits them to dist/oceans-lab.css and we import that
 * subpath explicitly so studio's bundle picks them up.
 *
 * `studioMobile` is forwarded to OceansLab so the lab knows it must not
 * issue any network requests. We also persist a simple `step` counter to
 * IDB so the catalog's Continue pill reflects how far the student got;
 * full label/trained-state restoration is out of scope for the hackathon.
 */
export default function OceansContainer({studioMobile}: LabEntryProps) {
  const [restoredStep, setRestoredStep] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    get(courseProgressKey(SLUG)).then(progress => {
      if (!alive) return;
      const step = typeof progress?.step === 'number' ? progress.step : 0;
      setRestoredStep(step);
    });
    return () => {
      alive = false;
    };
  }, []);

  const onContinue = useCallback(() => {
    // The lab calls onContinue at the end of each activity step. We bump
    // the persisted counter so a returning student sees their progress.
    get(courseProgressKey(SLUG))
      .then(prev => {
        const nextStep = (typeof prev?.step === 'number' ? prev.step : 0) + 1;
        return set(courseProgressKey(SLUG), {
          ...(prev ?? {}),
          step: nextStep,
          updatedAt: Date.now(),
        });
      })
      .catch(() => {
        // Non-fatal. The student still finished the step; we just don't
        // record it.
      });
  }, []);

  // Wait one render before mounting so the restored step is visible to the
  // lab; today the lab doesn't consume `initialStep` but threading the
  // restored value here keeps the contract honest.
  if (restoredStep === null) {
    return <Box className="oceans-lab-shell" />;
  }

  return (
    <Box className="oceans-lab-shell">
      <Box className="oceans-lab-frame">
        <OceansLab studioMobile={studioMobile} onContinue={onContinue} />
      </Box>
    </Box>
  );
}
