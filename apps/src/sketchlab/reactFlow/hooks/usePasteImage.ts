import React, {useEffect} from 'react';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  MAX_PASTED_IMAGE_DIMENSION_PX,
} from '../constants';
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

// Scale natural image dimensions down to fit MAX_PASTED_IMAGE_DIMENSION_PX on
// the longest side, preserving aspect ratio. Images already within bounds keep
// their natural size.
function scaleToFit(naturalWidth: number, naturalHeight: number) {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return {width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT};
  }
  const longestSide = Math.max(naturalWidth, naturalHeight);
  if (longestSide <= MAX_PASTED_IMAGE_DIMENSION_PX) {
    return {width: naturalWidth, height: naturalHeight};
  }
  const scale = MAX_PASTED_IMAGE_DIMENSION_PX / longestSide;
  return {
    width: Math.round(naturalWidth * scale),
    height: Math.round(naturalHeight * scale),
  };
}

// Read a blob's natural dimensions by decoding it through an Image. Falls back
// to the default node size if the image can't be decoded.
function readImageDimensions(
  file: File
): Promise<{width: number; height: number}> {
  return new Promise(resolve => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(scaleToFit(image.naturalWidth, image.naturalHeight));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT});
    };
    image.src = objectUrl;
  });
}

interface UsePasteImageOptions {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  readOnly: boolean;
  levelName: string;
  channelId: string;
  // The internal element-clipboard paste (duplicating a copied node/line).
  pasteInternal: () => void;
  addImageNode: (
    request: AddNodeRequest,
    dimensions?: {width: number; height: number}
  ) => void;
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

      const dimensions = await readImageDimensions(file);
      try {
        const uploadUrl = await uploadImageAsset(file, {levelName, channelId});
        if (!uploadUrl) {
          return;
        }
        addImageNode(
          {type: 'image', data: {src: uploadUrl, altText: ''}},
          dimensions
        );
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
