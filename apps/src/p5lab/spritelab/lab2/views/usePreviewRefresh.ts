import {useCallback, useEffect, useRef} from 'react';

// How long after the last edit the preview runs again.
const PREVIEW_DEBOUNCE_MS = 400;

/**
 * Returns a function that runs the preview shortly after its last call.
 *
 * The engine holds a preview on its first frame. A preview that started
 * while the game played would restart the game and hold it there, so on the
 * Play tab a call does nothing and a run that is waiting is dropped.
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
