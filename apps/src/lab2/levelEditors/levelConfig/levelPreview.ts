// The messages between the level edit page and the lab it previews in a
// frame. The edit page opens the level with PREVIEW_PARAM; the lab says it
// is ready, and the page sends it the settings as they are edited. The
// lab runs the level with those settings and saves nothing.

import {useEffect, useState} from 'react';

export const PREVIEW_PARAM = 'level_config_preview';
export const PREVIEW_READY = 'lab2-level-config-preview-ready';
export const PREVIEW_CONFIG = 'lab2-level-config-preview-config';

export interface PreviewState {
  /** The settings the edit page sent last; undefined until it sends. */
  config?: unknown;
  /** Counts the settings received, so the lab can start over on each. */
  version: number;
}

export function isLevelConfigPreview(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.parent !== window &&
    new URLSearchParams(window.location.search).get(PREVIEW_PARAM) === '1'
  );
}

/** In a preview frame, the settings the edit page sends; elsewhere,
    undefined. */
export function useLevelConfigPreview(): PreviewState | undefined {
  const [active] = useState(isLevelConfigPreview);
  const [state, setState] = useState<PreviewState>({version: 0});
  useEffect(() => {
    if (!active) {
      return;
    }
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== PREVIEW_CONFIG
      ) {
        return;
      }
      setState(previous => ({
        config: event.data.config,
        version: previous.version + 1,
      }));
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({type: PREVIEW_READY}, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, [active]);
  return active ? state : undefined;
}
