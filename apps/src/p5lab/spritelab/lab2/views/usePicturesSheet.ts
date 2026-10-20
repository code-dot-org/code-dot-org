import {useCallback, useEffect, useRef, useState} from 'react';

import {ImageType} from '../ai/images/types';
import {PictureRequest, setPictureRequestHandler} from '../picturePicker';

interface PicturesSheetOptions {
  /** The level offers Pictures; otherwise no picture request is answered. */
  offered: boolean;
  /** The lab is up, so the sheet can mount in an idle moment. */
  ready: boolean;
}

/**
 * The Pictures sheet's state: open or closed, mounted once and kept, and the
 * picture a block or the world palette asked for.
 */
export default function usePicturesSheet({
  offered,
  ready,
}: PicturesSheetOptions) {
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

  // A block or the world palette asks for a picture: the new-image dialog
  // opens on that kind, and the finished picture goes back to the asker.
  const [pickRequest, setPickRequest] = useState<PictureRequest | null>(null);
  useEffect(() => {
    if (!offered) {
      return;
    }
    return setPictureRequestHandler(request => {
      setPickRequest({...request});
      setMounted(true);
    });
  }, [offered]);
  const onImageCreated = useCallback(
    (name: string, imageType: ImageType) => {
      if (pickRequest) {
        pickRequest.onPicked(name, imageType);
        setPickRequest(null);
      }
    },
    [pickRequest]
  );
  const onPickCancel = useCallback(() => setPickRequest(null), []);

  // Inert while closed, except while a pick's dialog renders inside it
  // (React 18's JSX has no inert attribute).
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.inert = !open && !pickRequest;
    }
  }, [open, pickRequest, mounted]);
  // Escape inside the sheet closes it. The image dialogs render in a
  // portal, so their own Escape never reaches here.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    sheet.addEventListener('keydown', onKeyDown);
    return () => sheet.removeEventListener('keydown', onKeyDown);
  }, [open, mounted]);

  return {
    open,
    setOpen,
    mounted,
    pickRequest,
    sheetRef,
    onImageCreated,
    onPickCancel,
  };
}
