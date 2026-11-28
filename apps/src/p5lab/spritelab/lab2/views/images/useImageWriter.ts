// Writing the Images tab's pictures into the project. A generated or drawn
// picture becomes an image's pixels as soon as it is ready. A generated
// picture is uploaded at once. In a project, drawn pixels wait for the next
// save (see pendingUploads.ts); outside a project they are uploaded at once.
// When a session ends, uploaded files that no image points at are deleted.

import {useCallback, useEffect, useRef} from 'react';
import {AnyAction} from 'redux';

import {dataURIToSourceSize} from '@cdo/apps/imageUtils';
import {
  deleteAnimation,
  isNameUnique,
} from '@cdo/apps/p5lab/redux/animationList';
import {bytesToDataURI} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
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
  createDrawnAnimation,
  createNamedAnimation,
  framesPatch,
  repointAnimation,
} from '@cdo/apps/p5lab/spritelab/lab2/views/imageSave';
import {Verdict} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/verdict';
import useReclaimAsset from '@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset';
import useReleaseRemovedImages from '@cdo/apps/p5lab/spritelab/lab2/views/useReleaseRemovedImages';
import {PixelEditorSaveMeta} from '@cdo/apps/pixelEditor/PixelEditor';
import {getStore} from '@cdo/apps/redux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  dropHeldPixels,
  holdPixels,
  uploadDrawing,
  uploadsWithSave,
} from './pendingUploads';
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
  /** Called after the upload and before the image is updated; returning
      false abandons the save, for a drawing a picture replaced meanwhile. */
  stillWanted?: () => boolean;
}

export interface UploadedImage {
  filename: string;
  uint8Array: Uint8Array;
  mediaType: string;
  flagged?: boolean;
}

export interface ImageWriter {
  /** Stores a generated picture as the target image's pixels and resolves
      with the image's key, a new key for a new image. Rejects when the
      file cannot be uploaded. */
  acceptGenerated: (
    target: ImageTarget,
    result: GeneratedImageResult
  ) => Promise<string>;
  /** Stores an uploaded image already processed for
      storage, and resolves with its key as acceptGenerated does. Rejects
      when the file cannot be uploaded. */
  acceptUploaded: (target: ImageTarget, file: UploadedImage) => Promise<string>;
  /** Stores drawn pixels as the target image's pixels and resolves with
      its key, as acceptGenerated does. In a project, the pixels wait for
      the next save, and a drawing that arrives with no save left is not
      stored. Outside a project they are uploaded first, and a failed upload
      rejects. */
  saveEdited: (
    target: ImageTarget,
    dataURI: string,
    meta: PixelEditorSaveMeta,
    options?: SaveEditedOptions
  ) => Promise<string>;
  /** Writes the student's verdict into an image's generation record, the
      pixels untouched, and returns the record; undefined for an image with
      no record. */
  rateGenerated: (
    key: string,
    verdict: Verdict
  ) => ImageProps['generation'] | undefined;
  deleteImage: (key: string) => void;
  /** Starts a new session, and deletes the files the ended session uploaded
      or replaced that no image points at, each once neither the project's
      saved sources nor its sources waiting to be saved name it. A session is
      one image's run of generations and drawings. */
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
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const reclaimAsset = useReclaimAsset();
  const releaseRemovedImages = useReleaseRemovedImages();
  // Each picture's file address, keyed by the result's filename, so
  // choosing an earlier picture of the session again uploads nothing.
  const uploadsRef = useRef(new Map<string, Upload>());
  // The URL of every file the session uploaded, and of every file an image
  // stopped pointing at; one file can appear under several ?t= URLs.
  const sessionUrlsRef = useRef(new Set<string>());
  const recordSessionUrl = (url?: string) => {
    if (url) {
      sessionUrlsRef.current.add(url);
    }
  };

  const upload = useCallback(
    (filename: string, bytes: Uint8Array, mediaType: string) => {
      if (!uploadImage) {
        throw new Error('no uploader for this project');
      }
      return uploadImage(filename, bytes, mediaType);
    },
    [uploadImage]
  );

  const releaseSessionFiles = useCallback(() => {
    sessionUrlsRef.current.forEach(url => reclaimAsset(url));
    sessionUrlsRef.current = new Set();
    uploadsRef.current = new Map();
  }, [reclaimAsset]);
  const endSession = releaseSessionFiles;
  useEffect(() => releaseSessionFiles, [releaseSessionFiles]);

  const write = useCallback(
    (target: ImageTarget, patch: AnimationPatch, drawn = false): string => {
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
      return (drawn ? createDrawnAnimation : createNamedAnimation)(
        dispatch,
        name,
        {
          ...patch,
          categories: categoriesForType(target.imageType),
          ...(imageRole && {role: imageRole}),
          ...(target.subject && {subject: target.subject}),
        }
      );
    },
    [dispatch, imageRole]
  );
  // A generated or uploaded picture discards any drawn pixels still waiting
  // to upload for that image, so the next save does not upload them over it.
  const dropHeldPixelsOf = useCallback(
    (target: ImageTarget) => {
      if (target.key && channelId) {
        dropHeldPixels(channelId, target.key);
      }
    },
    [channelId]
  );

  const acceptGenerated = useCallback(
    async (target: ImageTarget, result: GeneratedImageResult) => {
      const dataURI = bytesToDataURI(result.uint8Array, result.mediaType);
      let uploaded = uploadsRef.current.get(result.filename);
      if (!uploaded) {
        const sourceUrl =
          result.publishedUrl ??
          (await upload(result.filename, result.uint8Array, result.mediaType));
        uploaded = {sourceUrl, frameSize: await measuredSize(dataURI)};
        uploadsRef.current.set(result.filename, uploaded);
        // A published file is not the project's to delete.
        if (!result.publishedUrl) {
          recordSessionUrl(sourceUrl);
        }
      }
      dropHeldPixelsOf(target);
      return write(target, {
        sourceUrl: uploaded.sourceUrl,
        dataURI,
        frameSize: uploaded.frameSize,
        sourceSize: uploaded.frameSize,
        // A character set's frame grid, or a plain picture's single frame,
        // which must overwrite any grid the image used to have.
        ...framesPatch(result.frames),
        pixelGridSize: result.pixelGridSize,
        trimmed: !!result.trimmed,
        generation: result.generation,
        fromGeneration: true,
        edited: false,
        pendingUpload: undefined,
      });
    },
    [upload, write, dropHeldPixelsOf]
  );

  const acceptUploaded = useCallback(
    async (target: ImageTarget, file: UploadedImage) => {
      const sourceUrl = await upload(
        file.filename,
        file.uint8Array,
        file.mediaType
      );
      recordSessionUrl(sourceUrl);
      const dataURI = bytesToDataURI(file.uint8Array, file.mediaType);
      const frameSize = await measuredSize(dataURI);
      dropHeldPixelsOf(target);
      return write(target, {
        sourceUrl,
        dataURI,
        frameSize,
        sourceSize: frameSize,
        ...framesPatch(undefined),
        // Not guaranteed to be pixel art.
        pixelGridSize: undefined,
        trimmed: false,
        generation: undefined,
        fromGeneration: false,
        edited: false,
        flagged: file.flagged,
        pendingUpload: undefined,
      });
    },
    [upload, write, dropHeldPixelsOf]
  );

  const saveEdited = useCallback(
    async (
      target: ImageTarget,
      dataURI: string,
      meta: PixelEditorSaveMeta,
      {stillWanted}: SaveEditedOptions = {}
    ) => {
      const existing = target.key ? propsOf(target.key) : undefined;
      // A project's saves upload its drawings. A level edited outside a
      // project has no such save, so its drawings are uploaded here.
      const waitForSave = !!channelId;
      if (waitForSave && !uploadsWithSave(channelId)) {
        // The level is being left, and no save of its project will start
        // after this, so nothing would save the link to a file uploaded
        // here.
        return target.key ?? '';
      }
      const sourceUrl = waitForSave
        ? undefined
        : await uploadDrawing(upload, existing ?? {}, dataURI);
      recordSessionUrl(sourceUrl);
      const frameSize = await measuredSize(dataURI);
      if (stillWanted && !stillWanted()) {
        return target.key ?? '';
      }
      // Keep the subject: the edit clears `generation`, where an older image
      // stored it.
      const subject =
        existing?.subject ?? existing?.generation?.subject ?? target.subject;
      const key = write(
        target,
        {
          ...(sourceUrl ? {sourceUrl} : {pendingUpload: true}),
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
          fromGeneration: existing?.fromGeneration || !!existing?.generation,
          edited: true,
          recentColors: meta.recentColors,
        },
        waitForSave
      );
      // `write` stores nothing for an image that was deleted while this
      // call was waiting, so no pixels are held for it.
      if (waitForSave && channelId && propsOf(key)) {
        holdPixels(channelId, key, dataURI);
      }
      return key;
    },
    [upload, write, channelId]
  );

  const rateGenerated = useCallback(
    (key: string, verdict: Verdict) => {
      const current = propsOf(key)?.generation;
      if (!current) {
        return undefined;
      }
      const generation = {...current, verdict};
      write({key, imageType: generation.imageType}, {generation});
      return generation;
    },
    [write]
  );

  const deleteImage = useCallback(
    (key: string) => {
      const removed = propsOf(key);
      if (channelId) {
        dropHeldPixels(channelId, key);
      }
      dispatch(
        // deleteAnimation is an untyped JS thunk; cast for dispatch.
        deleteAnimation(key, true /* isSpriteLab */) as unknown as AnyAction
      );
      releaseRemovedImages([removed]);
      if (removed?.name) {
        onDeleteImage(removed.name);
      }
    },
    [dispatch, releaseRemovedImages, onDeleteImage, channelId]
  );

  return {
    acceptGenerated,
    acceptUploaded,
    saveEdited,
    rateGenerated,
    deleteImage,
    endSession,
  };
}
