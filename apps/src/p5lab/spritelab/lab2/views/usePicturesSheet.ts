import {useEffect, useRef, useState} from 'react';

interface PicturesSheetOptions {
  /** The lab is up, so the sheet can mount in an idle moment. */
  ready: boolean;
}

/**
 * The Pictures sheet's state: open or closed, and mounted once and kept.
 */
export default function usePicturesSheet({ready}: PicturesSheetOptions) {
  const [open, setOpen] = useState(false);
  // Mounted once and kept, so no opening pays the mount cost.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
    }
  }, [open]);
  useEffect(() => {
    if (!ready || mounted) {
      return;
    }
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => setMounted(true), {
        timeout: 3000,
      });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(() => setMounted(true), 1500);
    return () => window.clearTimeout(handle);
  }, [ready, mounted]);

  // Inert while closed (React 18's JSX has no inert attribute).
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.inert = !open;
    }
  }, [open, mounted]);
  return {open, setOpen, mounted, sheetRef};
}
