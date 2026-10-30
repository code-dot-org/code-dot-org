import {useLayoutEffect, useState} from 'react';

/**
 * Hook for getting the window size.
 */
export default function useWindowSize() {
  const [size, setSize] = useState([
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
  ]);
  useLayoutEffect(() => {
    function updateSize() {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      setSize([width, height]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}
