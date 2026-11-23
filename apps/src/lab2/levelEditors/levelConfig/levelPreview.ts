// The messages between the level edit page and the lab it previews in a
// frame. The edit page opens the level with PREVIEW_PARAM; the lab says it
// is ready, and the page sends it the settings as they are edited. The
// lab runs the level with those settings and saves nothing.
//
// A lab may also announce places in the level (for example the parts of a
// tutorial) as PreviewPlaces; the page then offers them, and asks the lab
// to go to the one picked.

import {useEffect, useState} from 'react';

export const PREVIEW_PARAM = 'level_config_preview';
export const PREVIEW_READY = 'lab2-level-config-preview-ready';
export const PREVIEW_CONFIG = 'lab2-level-config-preview-config';
export const PREVIEW_PLACES = 'lab2-level-config-preview-places';
export const PREVIEW_GO = 'lab2-level-config-preview-go';
export const PREVIEW_CURRENT = 'lab2-level-config-preview-current';

/** A place in the level the preview can go to. */
export interface PreviewPlace {
  id: string;
  label: string;
}

export interface PreviewState {
  /** The settings the edit page sent last; undefined until it sends. */
  config?: unknown;
  /** Counts the messages received, so the lab can start over on each. */
  version: number;
  /** The place the edit page asked for last, and how many requests there
      have been, so each request can be acted on once. */
  place?: {id: string; count: number};
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
        event.source !== window.parent
      ) {
        return;
      }
      if (event.data?.type === PREVIEW_CONFIG) {
        setState(previous => ({
          ...previous,
          config: event.data.config,
          version: previous.version + 1,
        }));
      } else if (event.data?.type === PREVIEW_GO) {
        setState(previous => ({
          ...previous,
          place: {
            id: String(event.data.place),
            count: (previous.place?.count ?? 0) + 1,
          },
          version: previous.version + 1,
        }));
      }
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({type: PREVIEW_READY}, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, [active]);
  return active ? state : undefined;
}

/** Does nothing outside the level config preview. */
export function announcePreviewPlaces(places: PreviewPlace[]): void {
  if (isLevelConfigPreview()) {
    window.parent.postMessage(
      {type: PREVIEW_PLACES, places},
      window.location.origin
    );
  }
}

/** Tells the edit page which place the preview is at now. Does nothing
    outside the level config preview. */
export function announcePreviewCurrentPlace(place: string): void {
  if (isLevelConfigPreview()) {
    window.parent.postMessage(
      {type: PREVIEW_CURRENT, place},
      window.location.origin
    );
  }
}
