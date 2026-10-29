import {
  MutableRefObject,
  RefCallback,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {reducedMotion} from '../reducedMotion';
import {Tab} from '../redux/spriteLab2Redux';

/** The fade's length: quick, so a tab is never slow. */
export const TAB_FADE_MS = 180;

/** An editor's wrapper, by the tab that shows it. */
export type TabEditors = Partial<
  Record<Tab, MutableRefObject<HTMLElement | null>>
>;

export interface TabFade {
  /**
   * A ref for an editor that mounts a render after its tab comes up: it
   * fills the editor's ref and fades the editor in then. Stable per tab.
   */
  ref: (tab: Tab) => RefCallback<HTMLElement>;
}

const fadeIn = (editor: HTMLElement) => {
  if (!reducedMotion()) {
    editor.animate?.([{opacity: 0}, {opacity: 1}], {
      duration: TAB_FADE_MS,
      easing: 'ease-out',
    });
  }
};

/**
 * Fades an editor in as its tab comes up, never on arrival. The editors
 * stay mounted and are unclipped to show, so the fade is by hand. An editor
 * still unmounted as its tab comes up fades once it mounts through `ref`.
 */
export default function useTabFade(
  activeTab: Tab,
  editors: TabEditors
): TabFade {
  const editorsRef = useRef(editors);
  editorsRef.current = editors;
  const shownTabRef = useRef<Tab | null>(null);
  // A tab that came up with its editor unmounted.
  const pendingRef = useRef<Tab | null>(null);
  useEffect(() => {
    const from = shownTabRef.current;
    shownTabRef.current = activeTab;
    if (!from || from === activeTab) {
      return;
    }
    const editor = editorsRef.current[activeTab]?.current;
    if (editor) {
      fadeIn(editor);
    } else if (editorsRef.current[activeTab]) {
      pendingRef.current = activeTab;
    }
  }, [activeTab]);

  const refs = useRef(new Map<Tab, RefCallback<HTMLElement>>());
  const ref = useCallback((tab: Tab) => {
    let callback = refs.current.get(tab);
    if (!callback) {
      callback = element => {
        const editor = editorsRef.current[tab];
        if (editor) {
          editor.current = element;
        }
        if (element && pendingRef.current === tab) {
          pendingRef.current = null;
          fadeIn(element);
        }
      };
      refs.current.set(tab, callback);
    }
    return callback;
  }, []);
  return {ref};
}
