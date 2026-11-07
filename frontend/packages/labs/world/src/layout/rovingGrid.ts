// One tab stop for a wrapped run of buttons: the arrows, Home and End move
// within it, and Tab leaves it (WAI-ARIA's roving tabindex). The run wraps by
// the width it is given, so up and down are found from where each one is drawn.

import {
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where a key moves focus from `from`, or undefined when it does not move. */
export function nextInGrid(
  boxes: readonly Box[],
  from: number,
  key: string,
): number | undefined {
  const last = boxes.length - 1;
  switch (key) {
    case 'ArrowLeft':
      return from > 0 ? from - 1 : undefined;
    case 'ArrowRight':
      return from < last ? from + 1 : undefined;
    case 'Home':
      return from > 0 ? 0 : undefined;
    case 'End':
      return from < last ? last : undefined;
    case 'ArrowUp':
    case 'ArrowDown':
      return nextRow(boxes, from, key === 'ArrowUp' ? -1 : 1);
    default:
      return undefined;
  }
}

/** The one in the next row that way whose middle is nearest this one's. */
function nextRow(
  boxes: readonly Box[],
  from: number,
  way: -1 | 1,
): number | undefined {
  const here = boxes[from];
  const middle = (box: Box) => box.x + box.width / 2;
  const slack = here.height / 2;
  const beyond = boxes
    .map((box, at) => ({box, at}))
    .filter(({box}) => (box.y - here.y) * way > slack);
  if (beyond.length === 0) {
    return undefined;
  }
  const row =
    way > 0
      ? Math.min(...beyond.map(({box}) => box.y))
      : Math.max(...beyond.map(({box}) => box.y));
  return beyond
    .filter(({box}) => Math.abs(box.y - row) <= slack)
    .reduce((best, one) =>
      Math.abs(middle(one.box) - middle(here)) <
      Math.abs(middle(best.box) - middle(here))
        ? one
        : best,
    ).at;
}

const KEY = 'data-roving-key';

/**
 * Roving focus over the elements a list marks with `itemProps`. The tab stop
 * is the one last focused, else `start`, else the first.
 */
export function useRovingGrid<T extends HTMLElement>(
  keys: readonly string[],
  start: string | undefined,
): {
  listRef: RefObject<T>;
  listProps: {
    onKeyDown: (event: KeyboardEvent) => void;
    onFocus: (event: FocusEvent) => void;
  };
  itemProps: (key: string) => {[KEY]: string; tabIndex: number};
} {
  const listRef = useRef<T>(null);
  const [active, setActive] = useState<string>();
  const stop =
    [active, start].find(key => key !== undefined && keys.includes(key)) ??
    keys[0];

  const onKeyDown = (event: KeyboardEvent) => {
    const items = [
      ...(listRef.current?.querySelectorAll<HTMLElement>(`[${KEY}]`) ?? []),
    ];
    const from = items.indexOf(event.target as HTMLElement);
    if (from < 0) {
      return;
    }
    const to = nextInGrid(
      items.map(item => item.getBoundingClientRect()),
      from,
      event.key,
    );
    if (to !== undefined) {
      event.preventDefault();
      items[to].focus();
    }
  };
  const onFocus = (event: FocusEvent) => {
    const key = (event.target as HTMLElement).getAttribute(KEY);
    if (key !== null) {
      setActive(key);
    }
  };
  return {
    listRef,
    listProps: {onKeyDown, onFocus},
    itemProps: key => ({[KEY]: key, tabIndex: key === stop ? 0 : -1}),
  };
}
