// One image-dialog session: the Alternatives strip's entries, and the asset
// URLs that must survive until the session ends (any of them may yet be
// chosen). Ending the session reclaims whichever are left unreferenced.

import {useCallback, useRef, useState} from 'react';

import {createUuid} from '@cdo/apps/utils';

import {ImageGenerationMetadata} from '../ai/images/types';

// One entry in the strip: enough to make it the image again (and to carry
// its seed into the generate view).
export interface Alternative {
  id: string;
  thumb: string;
  sourceUrl: string;
  dataURI?: string;
  frameSize: {x: number; y: number} | null;
  pixelGridSize?: number;
  generation?: ImageGenerationMetadata;
}

// The strip shows the last few results; older ones age out.
const MAX_ALTERNATIVES = 5;

/** The strip entry for an animation's current state, or null without one. */
export function alternativeFromAnimation(props?: {
  dataURI?: string;
  sourceUrl?: string;
  frameSize?: {x: number; y: number};
  pixelGridSize?: number;
  generation?: ImageGenerationMetadata;
}): Alternative | null {
  const thumb = props?.dataURI || props?.sourceUrl;
  if (!props || !thumb) {
    return null;
  }
  return {
    id: createUuid(),
    thumb,
    sourceUrl: props.sourceUrl || thumb,
    dataURI: props.dataURI,
    frameSize: props.frameSize || null,
    pixelGridSize: props.pixelGridSize,
    generation: props.generation,
  };
}

export function useImageSession(reclaimAsset: (url?: string) => void) {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const urls = useRef<Set<string>>(new Set());
  // The entry for the image the dialog opened on: the one entry that never
  // ages out, since losing it would delete the original at session end.
  const seedId = useRef<string | null>(null);

  const push = useCallback((alt: Alternative) => {
    setAlternatives(prev => {
      const next = [...prev, alt];
      if (next.length <= MAX_ALTERNATIVES) {
        return next;
      }
      // Age out the oldest entry that isn't the seed (always first).
      return next[0].id === seedId.current
        ? [next[0], ...next.slice(2)]
        : next.slice(1);
    });
  }, []);

  // An asset this session made or superseded; kept until the session ends.
  const noteAsset = useCallback((url?: string) => {
    if (url) {
      urls.current.add(url);
    }
  }, []);

  // Reclaim whatever the session holds: the chosen image is referenced and
  // survives; the also-rans are deleted.
  const sweep = useCallback(() => {
    urls.current.forEach(url => reclaimAsset(url));
    urls.current = new Set();
  }, [reclaimAsset]);

  // Start a session, seeded with the image the dialog opened on (if any)
  // so it stays choosable after a generation replaces it. Sweeps first, so
  // nothing noted between sessions is stranded.
  const reset = useCallback(
    (seed?: Alternative | null) => {
      sweep();
      seedId.current = seed?.id || null;
      setAlternatives(seed ? [seed] : []);
    },
    [sweep]
  );

  // End the session.
  const end = useCallback(() => {
    sweep();
    seedId.current = null;
    setAlternatives([]);
  }, [sweep]);

  // The callbacks are stable; depend on the pieces, not the object.
  return {alternatives, push, noteAsset, reset, end};
}
