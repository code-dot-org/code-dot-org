import {useCallback, useEffect, useRef} from 'react';

const PREVIEW_DEBOUNCE_MS = 400;

/**
 * Returns a function that runs the preview shortly after its last call.
 *
 * Running the preview replaces the game being played with a still first
 * frame, so while the game plays a call does nothing and a waiting run is
 * dropped.
 */
export default function usePreviewRefresh(
  runPreview: () => void,
  playing: boolean
): () => void {
  const timer = useRef<number>();
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const runPreviewRef = useRef(runPreview);
  runPreviewRef.current = runPreview;

  useEffect(() => {
    if (playing) {
      window.clearTimeout(timer.current);
    }
  }, [playing]);

  return useCallback(() => {
    window.clearTimeout(timer.current);
    if (playingRef.current) {
      return;
    }
    timer.current = window.setTimeout(() => {
      if (!playingRef.current) {
        runPreviewRef.current();
      }
    }, PREVIEW_DEBOUNCE_MS);
  }, []);
}
