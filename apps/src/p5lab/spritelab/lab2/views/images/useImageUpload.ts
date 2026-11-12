import {ChangeEvent, useCallback, useRef, useState} from 'react';

import {useFlaggedImage} from '@cdo/apps/lab2/hooks/useFlaggedImage';
import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import {moderateImage} from '@cdo/apps/util/moderateImage';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {downscaleToFit} from '../../ai/images/imageGeneration';
import {MODEL_OUTPUT_PX, STORED_MAX_PX} from '../../ai/images/modelHelpers';
import {ImageKind, ImageType} from '../../ai/images/types';

import type {UploadedImage} from './useImageWriter';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];

/** The project type moderation and the flagged dialog file this lab under. */
export const MODERATION_APP_NAME = 'spritelab';
const UPLOADER_TYPE = 'SpriteLab2';

// FilesApi#max_file_size.
const MAX_UPLOAD_BYTES = 5_000_000;

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
  const [working, setWorking] = useState(false);
  const kindRef = useRef<ImageKind | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Without a project there is nothing to flag, and the uploader is a
  // levelbuilder making a starter asset.
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const {
    flaggedImageData,
    onImageFlagged,
    handleAcceptFlaggedImage,
    handleCancelFlaggedImage,
  } = useFlaggedImage(UPLOADER_TYPE);

  // Stays true while a flagged picture waits on the student: a second pick
  // would overwrite the one pending answer and silently drop it.
  const uploading = working || flaggedImageData !== null;

  const store = useCallback(
    async (kind: ImageKind, file: File, flagged?: boolean) => {
      const image = await downscaleImage(file, kind.imageType);
      await onAccepted(kind, {...image, flagged});
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
      if (file.size >= MAX_UPLOAD_BYTES) {
        onError(UPLOAD_ERRORS.tooBig);
        return;
      }
      setWorking(true);
      onProgress?.('Checking your picture.');
      try {
        // Moderation goes by the browser's reported type, so bytes it would
        // reject as a 400 would come back as 'error' and be let through.
        if (!(await decodable(file))) {
          onError(UPLOAD_ERRORS.wrongType);
          return;
        }
        if (channelId) {
          // The picture as picked, not as stored: a block is downscaled to
          // 256px, too small to judge, and a refused one never gets there.
          const verdict = await moderateImage(file, MODERATION_APP_NAME, {
            uploaderType: UPLOADER_TYPE,
          });
          if (verdict === 'flagged') {
            onImageFlagged(file, EXTENSIONS[file.type] ?? '', async () => {
              setWorking(true);
              onProgress?.('Adding your picture.');
              try {
                await store(kind, file, true);
              } catch (error) {
                onError(UPLOAD_ERRORS.failed);
                // Rethrow so useFlaggedImage leaves the project unflagged
                // when the picture it would be flagged for never landed.
                throw error;
              } finally {
                setWorking(false);
              }
            });
            return;
          }
        }
        onProgress?.('Adding your picture.');
        await store(kind, file);
      } catch {
        onError(UPLOAD_ERRORS.failed);
      } finally {
        setWorking(false);
      }
    },
    [channelId, onError, onImageFlagged, onProgress, store]
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

  // CustomDialog sets disableRestoreFocus, so focus falls to the body when
  // the dialog goes; put it back on the button that opened all this.
  const acceptFlaggedImage = useCallback(async () => {
    await handleAcceptFlaggedImage(MODERATION_APP_NAME);
    triggerRef.current?.focus();
  }, [handleAcceptFlaggedImage]);

  const cancelFlaggedImage = useCallback(() => {
    handleCancelFlaggedImage(MODERATION_APP_NAME);
    onProgress?.('Picture not added.');
    triggerRef.current?.focus();
  }, [handleCancelFlaggedImage, onProgress]);

  return {
    pickFile,
    FileInput,
    uploading,
    /** Set while a flagged picture waits on the student's answer. */
    flaggedImage: flaggedImageData,
    acceptFlaggedImage,
    cancelFlaggedImage,
  };
}
