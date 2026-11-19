import {useCallback, useEffect, useRef} from 'react';

const PREVIEW_DEBOUNCE_MS = 400;

/**
 * Returns a function that runs the preview shortly after its last call.
 *
 * Running the preview replaces the game being played with a still first
 * frame, so on the Play tab a call does nothing and a waiting run is dropped.
 */
export default function usePreviewRefresh(
  runPreview: () => void,
  onPlayTab: boolean
): () => void {
  const timer = useRef<number>();
  const onPlayTabRef = useRef(onPlayTab);
  onPlayTabRef.current = onPlayTab;
  const runPreviewRef = useRef(runPreview);
  runPreviewRef.current = runPreview;

  useEffect(() => {
    if (onPlayTab) {
      window.clearTimeout(timer.current);
    }
  }, [onPlayTab]);

  return useCallback(() => {
    window.clearTimeout(timer.current);
    if (onPlayTabRef.current) {
      return;
    }
    timer.current = window.setTimeout(() => {
      if (!onPlayTabRef.current) {
        runPreviewRef.current();
      }
    }, PREVIEW_DEBOUNCE_MS);
  }, []);
}
