import {ChangeEvent, useCallback, useRef, useState} from 'react';

import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';

import {downscaleToFit} from '../../ai/images/imageGeneration';
import {MODEL_OUTPUT_PX, STORED_MAX_PX} from '../../ai/images/modelHelpers';
import {ImageKind, ImageType} from '../../ai/images/types';

import type {UploadedImage} from './useImageWriter';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];

// The asset endpoint's per-file ceiling.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

export const UPLOAD_ERRORS = {
  tooBig: 'That picture is too big. Pick one smaller than 5 MB.',
  wrongType: "That kind of file can't be used. Pick a PNG or JPG picture.",
  failed: "That picture couldn't be added. Try again.",
};

/** Whether the bytes really are a picture. */
async function decodable(blob: Blob): Promise<boolean> {
  try {
    (await createImageBitmap(blob)).close();
    return true;
  } catch {
    return false;
  }
}

function assetFilename(name: string, mediaType: string): string {
  const base = (name.replace(/\.[^.]*$/, '') || 'picture')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40);
  return `upload_${base}_${Date.now()}.${EXTENSIONS[mediaType] ?? 'png'}`;
}

async function downscaleImage(file: File, imageType: ImageType) {
  const blob = await downscaleToFit(
    file,
    // Fall back to max model output size if no stored ceiling exists for this image type.
    STORED_MAX_PX[imageType] ?? MODEL_OUTPUT_PX
  );
  const mediaType = EXTENSIONS[blob.type] ? blob.type : 'image/png';
  return {
    uint8Array: new Uint8Array(await blob.arrayBuffer()),
    mediaType,
    filename: assetFilename(file.name, mediaType),
  };
}

interface UseImageUploadOptions {
  onAccepted: (kind: ImageKind, image: UploadedImage) => Promise<void>;
  onError: (message: string) => void;
  /** Said aloud to a screen reader while the work runs. */
  onProgress?: (message: string) => void;
}

export default function useImageUpload({
  onAccepted,
  onError,
  onProgress,
}: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const kindRef = useRef<ImageKind | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const store = useCallback(
    async (kind: ImageKind, file: File) => {
      const image = await downscaleImage(file, kind.imageType);
      await onAccepted(kind, image);
    },
    [onAccepted]
  );

  const handleFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      const kind = kindRef.current;
      triggerRef.current?.focus();
      if (!file || !kind) {
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError(UPLOAD_ERRORS.wrongType);
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        onError(UPLOAD_ERRORS.tooBig);
        return;
      }
      setUploading(true);
      onProgress?.('Adding your picture.');
      try {
        if (!(await decodable(file))) {
          onError(UPLOAD_ERRORS.wrongType);
          return;
        }
        await store(kind, file);
      } catch {
        onError(UPLOAD_ERRORS.failed);
      } finally {
        setUploading(false);
      }
    },
    [onError, onProgress, store]
  );

  const [openFileInput, FileInput] = useHiddenFileInput(
    handleFile,
    ACCEPTED_TYPES.join(','),
    false
  );

  const pickFile = useCallback(
    (kind: ImageKind, trigger: HTMLElement | null) => {
      kindRef.current = kind;
      triggerRef.current = trigger;
      openFileInput();
    },
    [openFileInput]
  );

  return {pickFile, FileInput, uploading};
}
