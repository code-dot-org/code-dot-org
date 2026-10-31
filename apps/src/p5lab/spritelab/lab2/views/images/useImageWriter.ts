// Writing the Images tab's pictures into the project: a generated or drawn
// picture becomes an image's pixels the moment it lands, uploads are made
// once per picture, and the files a session leaves behind are reclaimed
// when it ends.

import {useCallback, useEffect, useRef} from 'react';
import {AnyAction} from 'redux';

import {dataURIToSourceSize} from '@cdo/apps/imageUtils';
import {
  deleteAnimation,
  isNameUnique,
} from '@cdo/apps/p5lab/redux/animationList';
import {PixelEditorSaveMeta} from '@cdo/apps/pixelEditor/PixelEditor';
import {getStore} from '@cdo/apps/redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {bytesToDataURI, dataURIToBytes} from '../../ai/images/encoding';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '../../ai/images/imageGeneration';
import {MODEL_OUTPUT_PX} from '../../ai/images/modelHelpers';
import {ImageSubject, ImageType} from '../../ai/images/types';
import {categoriesForType} from '../../imageGallery';
import {nextImageName} from '../../imageReferences';
import {
  AnimationPatch,
  createNamedAnimation,
  framesPatch,
  repointAnimation,
  uploadOrEmbed,
} from '../imageSave';
import useReclaimAsset from '../useReclaimAsset';

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

export interface ImageWriter {
  /** A generated picture becomes the target's pixels; resolves to the key
      it lives under, which is new for a new image. */
  acceptGenerated: (
    target: ImageTarget,
    result: GeneratedImageResult
  ) => Promise<string>;
  /** Drawn pixels become the target's; the key, as above. */
  saveEdited: (
    target: ImageTarget,
    dataURI: string,
    meta: PixelEditorSaveMeta
  ) => Promise<string>;
  deleteImage: (key: string) => void;
  /** Reclaim the files the session no longer uses and forget its uploads;
      a session is one image's run of generations. */
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
  // Uploads by picture, so a picture swapped back in is not uploaded again.
  const uploadsRef = useRef(new Map<string, Upload>());
  // Every file the session made or replaced; whichever is unreferenced at
  // the end is deleted.
  const sessionUrlsRef = useRef(new Set<string>());
  const noteUrl = (url?: string) => {
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
      if (target.key && propsOf(target.key)) {
        noteUrl(repointAnimation(dispatch, target.key, patch));
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
        noteUrl(sourceUrl);
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
      });
    },
    [uploadImage, write]
  );

  const saveEdited = useCallback(
    async (target: ImageTarget, dataURI: string, meta: PixelEditorSaveMeta) => {
      const existing = target.key ? propsOf(target.key) : undefined;
      const safeName = (existing?.name || 'image')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');
      const sourceUrl = await uploadOrEmbed(
        uploadImage,
        `${safeName}_${Date.now()}.png`,
        dataURIToBytes(dataURI),
        'image/png',
        dataURI
      );
      noteUrl(sourceUrl);
      const frameSize = await measuredSize(dataURI);
      return write(target, {
        sourceUrl,
        dataURI,
        // An edited character set keeps its frame grid (the editor hands
        // back the same canvas); a plain picture takes the measured size.
        ...(existing?.poses
          ? {}
          : {frameSize, sourceSize: frameSize, ...framesPatch(undefined)}),
        // A set's frame goes back into the strip at the strip's own size,
        // so the strip keeps whatever grid it had.
        pixelGridSize: existing?.poses
          ? existing.pixelGridSize
          : meta.pixelGridSize,
        trimmed: false,
        // Hand-edited pixels are not the prompt's output anymore.
        generation: undefined,
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
