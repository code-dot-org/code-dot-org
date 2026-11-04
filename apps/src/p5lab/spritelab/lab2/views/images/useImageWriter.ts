// Writing the Images tab's pictures into the project. A generated or drawn
// picture becomes an image's pixels as soon as it is ready; each picture is
// uploaded once; when a session ends, uploaded files that no image points
// at are deleted.

import {useCallback, useEffect, useRef} from 'react';
import {AnyAction} from 'redux';

import {dataURIToSourceSize} from '@cdo/apps/imageUtils';
import {
  deleteAnimation,
  isNameUnique,
} from '@cdo/apps/p5lab/redux/animationList';
import {
  bytesToDataURI,
  dataURIToBytes,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {MODEL_OUTPUT_PX} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {categoriesForType} from '@cdo/apps/p5lab/spritelab/lab2/imageGallery';
import {nextImageName} from '@cdo/apps/p5lab/spritelab/lab2/imageReferences';
import {
  AnimationPatch,
  createNamedAnimation,
  framesPatch,
  repointAnimation,
  uploadOrEmbed,
} from '@cdo/apps/p5lab/spritelab/lab2/views/imageSave';
import useReclaimAsset from '@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset';
import {PixelEditorSaveMeta} from '@cdo/apps/pixelEditor/PixelEditor';
import {getStore} from '@cdo/apps/redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {ImageProps} from './projectImages';

/** Which image a picture is for: an existing one by key, or a new one. */
export interface ImageTarget {
  key: string | null;
  imageType: ImageType;
  subject?: ImageSubject;
}

interface Upload {
  sourceUrl: string;
  frameSize: {x: number; y: number};
}

interface WriterOptions {
  uploadImage?: UploadImageFunction;
  /** Recorded on every image made here. */
  imageRole?: string;
  /** Drop every reference to a deleted image (called after the removal). */
  onDeleteImage: (name: string) => void;
}

export interface SaveEditedOptions {
  /** False stores the pixels in the project without uploading the file;
      a new image is always uploaded, since it has no file yet. */
  upload?: boolean;
  /** Called after the upload and before the image is updated; returning
      false abandons the save, for a drawing a picture replaced meanwhile. */
  stillWanted?: () => boolean;
}

export interface ImageWriter {
  /** Stores a generated picture as the target image's pixels and resolves
      with the image's key, a new key for a new image. */
  acceptGenerated: (
    target: ImageTarget,
    result: GeneratedImageResult
  ) => Promise<string>;
  /** Stores drawn pixels as the target image's pixels and resolves with
      its key, as acceptGenerated does. */
  saveEdited: (
    target: ImageTarget,
    dataURI: string,
    meta: PixelEditorSaveMeta,
    options?: SaveEditedOptions
  ) => Promise<string>;
  deleteImage: (key: string) => void;
  /** Deletes the session's uploaded files that no image points at any
      more, and forgets its uploads. A session is one image's run of
      generations. */
  endSession: () => void;
}

const measuredSize = async (dataURI: string) =>
  (await dataURIToSourceSize(dataURI).catch(() => null)) ?? {
    x: MODEL_OUTPUT_PX,
    y: MODEL_OUTPUT_PX,
  };

const propsOf = (key: string): ImageProps | undefined =>
  getStore().getState().animationList.propsByKey[key];

export default function useImageWriter({
  uploadImage,
  imageRole,
  onDeleteImage,
}: WriterOptions): ImageWriter {
  const dispatch = useAppDispatch();
  const reclaimAsset = useReclaimAsset();
  // Uploads keyed by the result's filename, so choosing an earlier picture
  // of the session again reuses its upload.
  const uploadsRef = useRef(new Map<string, Upload>());
  // Every file the session uploaded or replaced; those no image points at
  // when the session ends are deleted.
  const sessionUrlsRef = useRef(new Set<string>());
  const recordSessionUrl = (url?: string) => {
    if (url) {
      sessionUrlsRef.current.add(url);
    }
  };

  const endSession = useCallback(() => {
    sessionUrlsRef.current.forEach(url => reclaimAsset(url));
    sessionUrlsRef.current = new Set();
    uploadsRef.current = new Map();
  }, [reclaimAsset]);
  useEffect(() => endSession, [endSession]);

  const write = useCallback(
    (target: ImageTarget, patch: AnimationPatch): string => {
      if (target.key) {
        // An image deleted while its save was in progress stays deleted:
        // nothing is written for it.
        if (propsOf(target.key)) {
          recordSessionUrl(repointAnimation(dispatch, target.key, patch));
        }
        return target.key;
      }
      const name = nextImageName(
        target.imageType,
        candidate =>
          !isNameUnique(
            candidate,
            getStore().getState().animationList.propsByKey
          )
      );
      return createNamedAnimation(dispatch, name, {
        ...patch,
        categories: categoriesForType(target.imageType),
        ...(imageRole && {role: imageRole}),
        ...(target.subject && {subject: target.subject}),
      });
    },
    [dispatch, imageRole]
  );

  const acceptGenerated = useCallback(
    async (target: ImageTarget, result: GeneratedImageResult) => {
      const dataURI = bytesToDataURI(result.uint8Array, result.mediaType);
      let upload = uploadsRef.current.get(result.filename);
      if (!upload) {
        const sourceUrl = await uploadOrEmbed(
          uploadImage,
          result.filename,
          result.uint8Array,
          result.mediaType,
          dataURI
        );
        upload = {sourceUrl, frameSize: await measuredSize(dataURI)};
        uploadsRef.current.set(result.filename, upload);
        recordSessionUrl(sourceUrl);
      }
      return write(target, {
        sourceUrl: upload.sourceUrl,
        dataURI,
        frameSize: upload.frameSize,
        sourceSize: upload.frameSize,
        // A character set's frame grid, or a plain picture's single frame,
        // which must overwrite any grid the image used to have.
        ...framesPatch(result.frames),
        pixelGridSize: result.pixelGridSize,
        trimmed: !!result.trimmed,
        generation: result.generation,
        edited: false,
      });
    },
    [uploadImage, write]
  );

  const saveEdited = useCallback(
    async (
      target: ImageTarget,
      dataURI: string,
      meta: PixelEditorSaveMeta,
      {upload = true, stillWanted}: SaveEditedOptions = {}
    ) => {
      const existing = target.key ? propsOf(target.key) : undefined;
      const safeName = (existing?.name || 'image')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');
      const sourceUrl =
        upload || !existing
          ? await uploadOrEmbed(
              uploadImage,
              `${safeName}_${Date.now()}.png`,
              dataURIToBytes(dataURI),
              'image/png',
              dataURI
            )
          : undefined;
      recordSessionUrl(sourceUrl);
      const frameSize = await measuredSize(dataURI);
      if (stillWanted && !stillWanted()) {
        return target.key ?? '';
      }
      // Keep the subject: the edit clears `generation`, where an older image
      // stored it.
      const subject =
        existing?.subject ?? existing?.generation?.subject ?? target.subject;
      return write(target, {
        ...(sourceUrl && {sourceUrl}),
        dataURI,
        ...(subject && {subject}),
        // An edited character set keeps its frame grid (the editor hands
        // back the same canvas); a plain picture takes the measured size.
        ...(existing?.poses
          ? {}
          : {frameSize, sourceSize: frameSize, ...framesPatch(undefined)}),
        pixelGridSize: meta.pixelGridSize,
        trimmed: false,
        // Hand-edited pixels are not the prompt's output anymore.
        generation: undefined,
        edited: true,
        recentColors: meta.recentColors,
      });
    },
    [uploadImage, write]
  );

  const deleteImage = useCallback(
    (key: string) => {
      const removed = propsOf(key);
      dispatch(
        // deleteAnimation is an untyped JS thunk; cast for dispatch.
        deleteAnimation(key, true /* isSpriteLab */) as unknown as AnyAction
      );
      reclaimAsset(removed?.sourceUrl);
      if (removed?.name) {
        onDeleteImage(removed.name);
      }
    },
    [dispatch, reclaimAsset, onDeleteImage]
  );

  return {acceptGenerated, saveEdited, deleteImage, endSession};
}
