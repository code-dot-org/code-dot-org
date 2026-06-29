import React, {useEffect} from 'react';

import {INTERNAL_CLIPBOARD_MARKER} from '../constants';
import {uploadImageAsset} from '../utils/uploadImageAsset';

// True when the paste target is a place where typing is the point — an input,
// textarea, or contentEditable (e.g. a TextNode editor). There we let the
// browser do its normal text paste instead of dropping an image node.
function isTargetEditable(target: HTMLElement): boolean {
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA'
  );
}

interface UsePasteOptions {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  readOnly: boolean;
  levelName: string;
  channelId: string;
  // The internal element-clipboard paste (duplicating a copied node/line).
  pasteInternal: () => void;
  // Drops a clipboard-pasted image onto the canvas as an ImageNode at the cursor.
  pasteImage: (src: string) => void;
}

/**
 * Listens for native paste events on the document and, when the clipboard holds
 * an image and the canvas is focused, uploads it and drops it onto the canvas as
 * an ImageNode at the cursor. When the clipboard holds no image, it falls back
 * to the internal element-clipboard paste. An in-app copy stamps the system
 * clipboard with a marker (see useCopyPaste); when that marker is present the
 * in-app copy is the most recent clipboard action, so a freshly copied node
 * pastes as a node rather than losing to a stale system-clipboard image.
 */
export function usePaste({
  canvasContainerRef,
  readOnly,
  levelName,
  channelId,
  pasteInternal,
  pasteImage,
}: UsePasteOptions) {
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (readOnly) {
        return;
      }
      const container = canvasContainerRef.current;
      if (!container || !container.contains(document.activeElement)) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && isTargetEditable(target)) {
        return;
      }

      // When our marker is present, the most recent clipboard action was an
      // in-app copy, so paste the copied element even if a stale image also
      // lingers in the clipboard.
      const clipboardText = event.clipboardData?.getData('text/plain') ?? '';
      const internalCopyIsLatest = clipboardText === INTERNAL_CLIPBOARD_MARKER;

      const items = event.clipboardData?.items;
      const imageItem =
        !internalCopyIsLatest && items
          ? Array.from(items).find(item => item.type.startsWith('image/'))
          : undefined;

      if (!imageItem) {
        event.preventDefault();
        pasteInternal();
        return;
      }

      event.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) {
        return;
      }

      try {
        const uploadUrl = await uploadImageAsset(file, {levelName, channelId});
        if (!uploadUrl) {
          return;
        }
        pasteImage(uploadUrl);
      } catch (error) {
        console.error('Failed to upload pasted image:', error);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [
    canvasContainerRef,
    readOnly,
    levelName,
    channelId,
    pasteInternal,
    pasteImage,
  ]);
}
