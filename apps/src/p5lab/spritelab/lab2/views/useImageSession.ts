// One image-dialog session: the Alternatives strip's entries, and the asset
// URLs that must survive until the session ends (any of them may yet be
// chosen). Ending the session reclaims whichever are left unreferenced.

import {useCallback, useMemo, useRef, useState} from 'react';

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

  const push = useCallback((alt: Alternative) => {
    setAlternatives(prev => [...prev, alt].slice(-MAX_ALTERNATIVES));
  }, []);

  // An asset this session made or superseded; kept until the session ends.
  const noteAsset = useCallback((url?: string) => {
    if (url) {
      urls.current.add(url);
    }
  }, []);

  // Start a session, seeded with the image the dialog opened on (if any) so
  // it stays choosable after a generation replaces it.
  const reset = useCallback((seed?: Alternative | null) => {
    urls.current = new Set();
    setAlternatives(seed ? [seed] : []);
  }, []);

  // End the session: the chosen image is referenced and survives; the
  // also-rans are reclaimed.
  const end = useCallback(() => {
    urls.current.forEach(url => reclaimAsset(url));
    urls.current = new Set();
    setAlternatives([]);
  }, [reclaimAsset]);

  // One stable object per alternatives-change, so consumers can put the
  // session in dependency lists without re-creating on every render.
  return useMemo(
    () => ({alternatives, push, noteAsset, reset, end}),
    [alternatives, push, noteAsset, reset, end]
  );
}
