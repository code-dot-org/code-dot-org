import React, {useEffect} from 'react';

import {AddNodeRequest} from '../types';
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

interface UsePasteImageOptions {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  readOnly: boolean;
  levelName: string;
  channelId: string;
  // The internal element-clipboard paste (duplicating a copied node/line).
  pasteInternal: () => void;
  addImageNode: (request: AddNodeRequest) => void;
}

/**
 * Listens for native paste events on the document and, when the clipboard holds
 * an image and the canvas is focused, uploads it and drops it onto the canvas as
 * an ImageNode. When the clipboard holds no image, it falls back to the internal
 * element-clipboard paste. Owning both paths here (rather than splitting image
 * paste from the keydown-driven internal paste) is what keeps a single Ctrl/Cmd+V
 * from both pasting an internal element and dropping the image.
 */
export function usePasteImage({
  canvasContainerRef,
  readOnly,
  levelName,
  channelId,
  pasteInternal,
  addImageNode,
}: UsePasteImageOptions) {
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

      const items = event.clipboardData?.items;
      const imageItem = items
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
        addImageNode({type: 'image', data: {src: uploadUrl, altText: ''}});
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
    addImageNode,
  ]);
}
