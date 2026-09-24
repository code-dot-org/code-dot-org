import {RefObject, useLayoutEffect, useState} from 'react';

/**
 * Hook for tracking an element's client size. Reports [0, 0] until the
 * element has mounted and been measured.
 */
export default function useElementSize(
  ref: RefObject<HTMLElement>
): [number, number] {
  const [size, setSize] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    function updateSize() {
      if (element) setSize([element.clientWidth, element.clientHeight]);
    }
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    updateSize();
    return () => observer.disconnect();
  }, [ref]);
  return size;
}
