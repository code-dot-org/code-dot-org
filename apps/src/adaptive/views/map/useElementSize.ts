import React, {useEffect, useRef, useState} from 'react';

export interface Size {
  width: number;
  height: number;
}

/** The element's size, tracked as it resizes; zero until measured. */
export function useElementSize<T extends HTMLElement>(): [
  React.RefObject<T>,
  Size
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({width: 0, height: 0});
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    // The client box leaves out scrollbars, so a scrolling map fits beside them.
    const measure = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      setSize(prev =>
        prev.width === width && prev.height === height ? prev : {width, height}
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}
