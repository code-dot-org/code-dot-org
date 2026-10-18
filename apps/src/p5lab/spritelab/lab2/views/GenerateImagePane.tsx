import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnyAction} from 'redux';

import {dataURIToSourceSize, toImage} from '@cdo/apps/imageUtils';
import {
  deleteAnimation,
  isNameUnique,
  SET_INITIAL_ANIMATION_LIST,
} from '@cdo/apps/p5lab/redux/animationList';
import {detectImageGridSize} from '@cdo/apps/pixelEditor/pixelArt';
import PixelEditorModal, {
  PixelEditorSaveMeta,
} from '@cdo/apps/pixelEditor/PixelEditorModal';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import {bytesToDataURI, dataURIToBytes} from '../ai/images/encoding';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '../ai/images/imageGeneration';
import {MODEL_OUTPUT_PX} from '../ai/images/modelHelpers';
import {ImageStyle, ImageSubject, ImageType} from '../ai/images/types';
import {AnimationPoses} from '../characterAnimations';
import {
  categoriesForType,
  galleryOrder,
  imageTypeFromCategories,
} from '../imageGallery';
import {
  forgetImageThumbnail,
  getImageThumbnail,
  onTrimsUpdated,
  trimAnimationListImages,
} from '../imageTrim';
import {BACKGROUND_GROUND_COLOR, blankPaintImage} from '../paintBlank';
import {PictureRequest} from '../picturePicker';

import PictureLibrary, {LibraryGroup} from './components/PictureLibrary';
import ImageDetailsDialog, {AlternativeImage} from './ImageDetailsDialog';
import {
  AnimationPatch,
  createNamedAnimation,
  framesPatch,
  uploadOrEmbed,
} from './imageSave';
import type {NewImageDraft} from './SentenceDialogBody';
import {framesFromAnimation, useImageSession} from './useImageSession';

import moduleStyles from './sprite-lab2-view.module.scss';

type Dispatch = ReturnType<typeof useAppDispatch>;

/** Where a strip's standing frame sits — the base picture the set was drawn
    from (the last frame of the stand range; see CHARACTER_STRIP_POSES). */
function standingFrameIndex(poses?: AnimationPoses): number {
  const stand = poses?.['stand-right'];
  return stand ? stand.start + stand.count - 1 : 0;
}

/**
 * The standing frame of a character strip, full size. Falls back to the
 * whole image if the crop can't be made.
 */
async function cropStandingFrame(
  dataURI: string,
  props: {frameSize: {x: number; y: number}; poses?: AnimationPoses}
): Promise<string> {
  try {
    const img = await toImage(dataURI);
    const canvas = document.createElement('canvas');
    canvas.width = props.frameSize.x;
    canvas.height = props.frameSize.y;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return dataURI;
    }
    ctx.drawImage(img, -standingFrameIndex(props.poses) * props.frameSize.x, 0);
    return canvas.toDataURL('image/png');
  } catch {
    return dataURI;
  }
}

// The Alternatives row displays ~64px entries; full-resolution sources
// would each hold a decoded multi-megabyte bitmap for the dialog's life.
const ALTERNATIVE_THUMB_PX = 160;

/**
 * A small thumbnail for an Alternatives entry: a strip's standing frame, or
 * the whole picture, downscaled. Falls back to the full image.
 */
async function alternativeThumb(
  dataURI: string,
  frames?: GeneratedImageResult['frames']
): Promise<string> {
  try {
    const img = await toImage(dataURI);
    const cell = frames ? frames.frameSize : {x: img.width, y: img.height};
    const scale = Math.min(1, ALTERNATIVE_THUMB_PX / Math.max(cell.x, cell.y));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(cell.x * scale));
    canvas.height = Math.max(1, Math.round(cell.y * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return dataURI;
    }
    ctx.drawImage(
      img,
      (frames ? standingFrameIndex(frames.poses) : 0) * cell.x,
      0,
      cell.x,
      cell.y,
      0,
      0,
      canvas.width,
      canvas.height
    );
    return canvas.toDataURL('image/png');
  } catch {
    return dataURI;
  }
}

/**
 * Point an existing animation at new pixels and refresh its thumbnails.
 * Uses the raw list-replace action because the classic edit action clears
 * sourceUrl, which is what Lab2 saves. Returns the file URL the change
 * replaced.
 */
function repointAnimation(
  dispatch: Dispatch,
  key: string,
  changes: AnimationPatch
): string | undefined {
  const current = getStore().getState().animationList;
  const updated = {
    orderedKeys: current.orderedKeys,
    propsByKey: {
      ...current.propsByKey,
      [key]: {
        ...current.propsByKey[key],
        ...changes,
        loadedFromSource: true,
        saved: false,
      },
    },
  };
  dispatch({type: SET_INITIAL_ANIMATION_LIST, animationList: updated});
  trimAnimationListImages(updated);
  return current.propsByKey[key]?.sourceUrl;
}

interface GenerateImagePaneProps {
  uploadImage?: UploadImageFunction;
  /** Rename an image and every reference to it; error message or null. */
  onRenameImage: (oldName: string, newName: string) => string | null;
  /** Drop every reference to a deleted image (called after the removal). */
  onDeleteImage: (name: string) => void;
  /** Level-imposed type for new images. */
  lockedImageType?: ImageType;
  /** Level-imposed subject for new sprites. */
  lockedImageSubject?: ImageSubject;
  /** Recorded on every image made here. */
  imageRole?: string;
  /** Show the full internal dialog and gallery names; the default is the
      student version (auto-named images, fewer generation controls). */
  advanced?: boolean;
  /** Style the generate form starts on for new images. */
  defaultStyle?: ImageStyle;
  /** No paint entry points anywhere in the dialog. */
  paintDisabled?: boolean;
  /** A picture asked for from a block or the world palette: opens the
      new-image dialog on its kind. A new object each time. */
  pickRequest?: PictureRequest | null;
  /** A new image was made (generated or painted), by name and kind. */
  onImageCreated?: (name: string, imageType: ImageType) => void;
  /** The dialog a pick opened was closed without a picture. */
  onPickCancel?: () => void;
  /** Which side the chosen picture takes; the right unless given. */
  jumboSide?: 'left' | 'right';
}

/** The strips' titles, one per kind, in gallery order. */
const GROUP_TITLES: Record<ImageType, string> = {
  sprite: 'Characters',
  background: 'Backgrounds',
  block: 'Blocks',
};

/**
 * The Images editor: the project's pictures as a library, the chosen one
 * large. New image opens the dialog; a chosen picture paints straight into
 * the editor; a block's or the palette's pick opens the dialog on its kind.
 */
// Detection runs a full-raster scan (~tens of ms, more on Chromebooks) and
// the answer never changes for the same pixels, so it is cached across
// dialog opens. Keys are digests, not the sources themselves — a data URI
// key would pin megabytes per entry.
const gridDetectionCache = new Map<string, Promise<number | null>>();
const GRID_CACHE_MAX = 32;
function cachedGridDetection(
  source: string,
  frameSize?: {x: number; y: number}
): Promise<number | null> {
  const key = `${source.length}:${source.slice(0, 48)}:${source.slice(-48)}:${
    frameSize?.x ?? ''
  }x${frameSize?.y ?? ''}`;
  const hit = gridDetectionCache.get(key);
  if (hit) {
    return hit;
  }
  const pending = detectImageGridSize(source, frameSize).catch(() => {
    gridDetectionCache.delete(key);
    return null;
  });
  if (gridDetectionCache.size >= GRID_CACHE_MAX) {
    gridDetectionCache.delete(gridDetectionCache.keys().next().value as string);
  }
  gridDetectionCache.set(key, pending);
  return pending;
}

const GenerateImagePane: React.FunctionComponent<GenerateImagePaneProps> = ({
  uploadImage,
  onRenameImage,
  onDeleteImage,
  lockedImageType: levelImageType,
  lockedImageSubject: levelImageSubject,
  imageRole,
  advanced,
  defaultStyle,
  paintDisabled,
  pickRequest = null,
  onImageCreated,
  onPickCancel,
  jumboSide,
}) => {
  const dispatch = useAppDispatch();

  // The project's images, from the classic animation-list store. Sorted
  // under useMemo: a fresh array from the selector would count as a change
  // on every store dispatch.
  const animationList = useAppSelector(state => state.animationList);
  const images = useMemo(
    () =>
      galleryOrder(
        animationList.orderedKeys.map((key: string) => ({
          key,
          props: animationList.propsByKey[key],
        })),
        image => imageTypeFromCategories(image.props?.categories)
      ),
    [animationList]
  );

  // Gallery thumbnails prefer the border-trimmed image (backgrounds aren't
  // trimmed and fall through). Trims land as the engine preloads; re-render
  // when they do.
  const [, setTrimVersion] = useState(0);
  useEffect(() => onTrimsUpdated(() => setTrimVersion(v => v + 1)), []);

  // Compute trims for images added after the initial load (a fresh
  // generation lands here before any engine preload runs). The pass is
  // source-cached, so only new images do work.
  useEffect(() => {
    trimAnimationListImages(animationList);
  }, [animationList]);

  // Used only to recognize this project's own uploaded-file URLs.
  const channelId = useAppSelector(state => state.lab.channel?.id);

  // Delete an uploaded image file nothing uses anymore. Deliberately
  // narrow and best-effort: only this project's own uploads, only when no
  // image still points at the file, and a failed delete is ignored.
  const deleteUnreferencedAsset = useCallback(
    (url?: string) => {
      if (!channelId || !url || !url.startsWith(`/v3/assets/${channelId}/`)) {
        return;
      }
      const stillUsed = Object.values(
        getStore().getState().animationList.propsByKey
      ).some(p => (p as {sourceUrl?: string} | undefined)?.sourceUrl === url);
      if (stillUsed) {
        return;
      }
      HttpClient.delete(url, true).catch(() => undefined);
    },
    [channelId]
  );

  // Guards a second Save click while one save is in flight. Reset on every
  // editor open, so a save that never settles can't leave Save dead for the
  // next session.
  const savingPaintRef = useRef(false);

  // The dialog's subject: an animation key, 'new', or closed. Painting is
  // three-way so the two dialogs swap in one step: the details dialog stays
  // up through 'loading', and the paint editor takes over once it can
  // render — otherwise the backdrop blinks between them.
  const [dialogTarget, setDialogTarget] = useState<string | 'new' | null>(null);
  const [painting, setPainting] = useState<'no' | 'loading' | 'active'>('no');
  // Set while a brand-new image is being painted onto a blank canvas; kept
  // through a cancel so the form reopens with what was typed.
  const [paintNewDraft, setPaintNewDraft] = useState<NewImageDraft | null>(
    null
  );
  const blankPaint = useMemo(
    () =>
      paintNewDraft
        ? blankPaintImage(paintNewDraft.imageType, paintNewDraft.style)
        : null,
    [paintNewDraft]
  );

  const handlePaintNew = useCallback((draft: NewImageDraft) => {
    setPaintNewDraft(draft);
    savingPaintRef.current = false;
    setPainting('loading');
  }, []);

  const {
    alternatives,
    reset: resetSession,
    end: endSession,
    push: pushAlternative,
    noteAsset,
    seedSourceUrl,
  } = useImageSession(deleteUnreferencedAsset);
  // The gallery card that opened the dialog; focus returns to it on close.
  const triggerRef = useRef<HTMLElement | null>(null);

  // Counts changes of the dialog's subject. Generating and saving are
  // slow; a result that finishes after the subject changed must not land.
  const sessionEpochRef = useRef(0);
  // The count when the current generation was requested, so the whole
  // request is covered. One at a time: Generate disables while one is out.
  const generationEpochRef = useRef(0);
  const handleGenerateStart = useCallback(() => {
    generationEpochRef.current = sessionEpochRef.current;
  }, []);

  // True when work stamped with `epoch` no longer matches the subject;
  // whatever the stale work uploaded is deleted, since nothing uses it.
  const persistIsStale = useCallback(
    (epoch: number, uploadedUrl?: string) => {
      if (epoch === sessionEpochRef.current) {
        return false;
      }
      deleteUnreferencedAsset(uploadedUrl);
      return true;
    },
    [deleteUnreferencedAsset]
  );

  const openNewDialog = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      sessionEpochRef.current++;
      triggerRef.current = event.currentTarget;
      setDialogTarget('new');
      setPaintNewDraft(null);
      resetSession();
    },
    [resetSession]
  );
  // A pick opens the new-image dialog on the asker's kind; while it is
  // open, that kind is the locked one.
  useEffect(() => {
    if (!pickRequest) {
      return;
    }
    sessionEpochRef.current++;
    triggerRef.current = null;
    setDialogTarget('new');
    setPaintNewDraft(null);
    resetSession();
  }, [pickRequest, resetSession]);
  const lockedImageType = pickRequest?.imageType ?? levelImageType;
  const lockedImageSubject = pickRequest?.subject ?? levelImageSubject;
  // The asker gets the picture and the dialog closes, instead of the
  // summary: the student is on their way back to the block or the world.
  const pickedRef = useRef(onImageCreated);
  pickedRef.current = onImageCreated;
  const finishNew = useCallback(
    (key: string, name: string, imageType: ImageType) => {
      pickedRef.current?.(name, imageType);
      if (pickRequest) {
        setDialogTarget(null);
        setPainting('no');
        endSession();
      } else {
        setDialogTarget(key);
      }
    },
    [pickRequest, endSession]
  );

  const closeDialog = useCallback(() => {
    sessionEpochRef.current++;
    setDialogTarget(null);
    setPainting('no');
    setPaintNewDraft(null);
    endSession();
    if (pickRequest) {
      onPickCancel?.();
    }
    triggerRef.current?.focus();
  }, [endSession, pickRequest, onPickCancel]);

  // Leaving the tab mid-session must still reclaim the session's leftover
  // assets (and orphan any in-flight persist), exactly as closing would.
  useEffect(
    () => () => {
      sessionEpochRef.current++;
      endSession();
    },
    [endSession]
  );

  const targetProps =
    dialogTarget && dialogTarget !== 'new'
      ? images.find(i => i.key === dialogTarget)?.props
      : undefined;

  // The Resolution row's grid for a pixel image that never recorded one:
  // character sheets skip normalization (a strip's frames must agree), and
  // images saved before normalization existed have nothing stored — detect
  // what the model drew from the first frame instead. Display only. The
  // result is keyed to its source, so a switched dialog target never wears
  // the previous image's grid for a frame.
  const [detectedGrid, setDetectedGrid] = useState<{
    source: string;
    size: number;
  }>();
  const detectSource = targetProps?.dataURI || targetProps?.sourceUrl;
  const frameSize = targetProps?.frameSize;
  const needsGridDetection =
    targetProps?.generation?.style === 'pixel' &&
    !targetProps.pixelGridSize &&
    !!detectSource;
  useEffect(() => {
    if (!needsGridDetection || !detectSource) {
      return;
    }
    let canceled = false;
    cachedGridDetection(detectSource, frameSize)
      .then(size => {
        if (!canceled && size && size > 1) {
          setDetectedGrid({source: detectSource, size});
        }
      })
      .catch(() => {});
    return () => {
      canceled = true;
    };
  }, [needsGridDetection, detectSource, frameSize]);
  const detectedGridSize =
    detectedGrid && detectedGrid.source === detectSource
      ? detectedGrid.size
      : undefined;

  const deleteImage = useCallback(
    (key: string) => {
      const removed = getStore().getState().animationList.propsByKey[key];
      dispatch(
        // deleteAnimation is an untyped JS thunk; cast for dispatch.
        deleteAnimation(key, true /* isSpriteLab */) as unknown as AnyAction
      );
      // The removal already happened; reclaim the asset if unreferenced now,
      // and take the blocks and World cells that pointed at the image along.
      deleteUnreferencedAsset(removed?.sourceUrl);
      if (removed?.name) {
        onDeleteImage(removed.name);
      }
    },
    [dispatch, deleteUnreferencedAsset, onDeleteImage]
  );
  const handleDelete = useCallback(() => {
    if (dialogTarget && dialogTarget !== 'new') {
      deleteImage(dialogTarget);
    }
    closeDialog();
  }, [dialogTarget, deleteImage, closeDialog]);

  const handleRename = useCallback(
    (newName: string): string | null => {
      if (!targetProps?.name) {
        return 'Image not found.';
      }
      return onRenameImage(targetProps.name, newName);
    },
    [targetProps, onRenameImage]
  );

  const isNameTaken = useCallback(
    (name: string): boolean =>
      !isNameUnique(name, getStore().getState().animationList.propsByKey),
    []
  );

  // Current pixels as a data URI (generation's "use previous image" sends
  // them in a JSON request body, so an object-URL image is read back to
  // base64 here).
  const getTargetDataURI = useCallback(async (): Promise<string | null> => {
    if (!targetProps) {
      return null;
    }
    const readAsDataURL = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    let dataURI = targetProps.dataURI ?? null;
    try {
      if (dataURI?.startsWith('blob:')) {
        dataURI = await readAsDataURL(await (await fetch(dataURI)).blob());
      } else if (!dataURI && targetProps.sourceUrl) {
        dataURI = await readAsDataURL(
          await (await HttpClient.get(targetProps.sourceUrl)).blob()
        );
      }
    } catch {
      return null;
    }
    // "Start from current image" on a character set references one frame,
    // not the five-frame strip.
    return dataURI && targetProps.poses
      ? cropStandingFrame(dataURI, targetProps)
      : dataURI;
  }, [targetProps]);

  // Persist an accepted generation: upload, then create the animation (new
  // image) or repoint the existing one, with the generation metadata.
  const handleAcceptGenerated = useCallback(
    async (result: GeneratedImageResult, newName?: string) => {
      // Stamped when the generation was requested, so a dialog closed or
      // moved during the request drops its result here.
      const epoch = generationEpochRef.current;
      if (persistIsStale(epoch)) {
        return;
      }
      const dataURI = bytesToDataURI(result.uint8Array, result.mediaType);
      const sourceUrl = await uploadOrEmbed(
        uploadImage,
        result.filename,
        result.uint8Array,
        result.mediaType,
        dataURI
      );
      const frameSize: {x: number; y: number} | null =
        await dataURIToSourceSize(dataURI).catch(() => null);
      if (persistIsStale(epoch, sourceUrl)) {
        return;
      }

      pushAlternative({
        id: createUuid(),
        // A strip's row entry shows its standing frame, not the whole sheet.
        thumb: await alternativeThumb(dataURI, result.frames),
        sourceUrl,
        dataURI,
        frameSize,
        frames: result.frames,
        pixelGridSize: result.pixelGridSize,
        trimmed: result.trimmed,
        generation: result.generation,
      });
      noteAsset(sourceUrl);

      if (dialogTarget === 'new' && newName) {
        const key = createNamedAnimation(dispatch, newName, {
          sourceUrl,
          frameSize: frameSize || {x: MODEL_OUTPUT_PX, y: MODEL_OUTPUT_PX},
          ...framesPatch(result.frames),
          categories: categoriesForType(result.generation.imageType),
          ...(imageRole && {role: imageRole}),
          pixelGridSize: result.pixelGridSize,
          trimmed: !!result.trimmed,
          generation: result.generation,
        });
        // A new subject, even though the session continues.
        sessionEpochRef.current++;
        finishNew(key, newName, result.generation.imageType);
        return;
      }

      const key = dialogTarget;
      if (!key || key === 'new' || !targetProps) {
        return;
      }
      const previousUrl = repointAnimation(dispatch, key, {
        sourceUrl,
        dataURI,
        ...(frameSize ? {frameSize, sourceSize: frameSize} : {}),
        // A regenerated image takes the new result's frame grid: a plain
        // sprite replacing a character set drops its poses.
        ...framesPatch(result.frames),
        pixelGridSize: result.pixelGridSize,
        trimmed: !!result.trimmed,
        generation: result.generation,
      });
      // The superseded asset stays until the dialog closes: it's in the
      // Alternatives strip and may become the image again.
      noteAsset(previousUrl);
    },
    [
      finishNew,
      dialogTarget,
      imageRole,
      targetProps,
      uploadImage,
      dispatch,
      pushAlternative,
      noteAsset,
      persistIsStale,
    ]
  );

  // Make a strip entry the image again. The same repoint an accepted
  // generation does, minus the upload — the asset already exists.
  const handleSelectAlternative = useCallback(
    (id: string) => {
      const alt = alternatives.find(a => a.id === id);
      const key = dialogTarget;
      if (!alt || !key || key === 'new') {
        return;
      }
      // An entry with no pixel data in hand (the seed of an image loaded
      // from its URL) can't be re-trimmed until the data arrives; drop the
      // superseded image's cached trim so thumbnails don't keep showing it.
      if (!alt.dataURI) {
        forgetImageThumbnail(
          getStore().getState().animationList.propsByKey[key]?.name
        );
      }
      const previousUrl = repointAnimation(dispatch, key, {
        sourceUrl: alt.sourceUrl,
        dataURI: alt.dataURI,
        ...(alt.frameSize
          ? {frameSize: alt.frameSize, sourceSize: alt.frameSize}
          : {}),
        // The entry's frame grid comes back with it — or clears the frame
        // grid of the strip the image was a moment ago.
        ...framesPatch(alt.frames),
        pixelGridSize: alt.pixelGridSize,
        trimmed: !!alt.trimmed,
        generation: alt.generation,
      });
      noteAsset(previousUrl);
    },
    [alternatives, dialogTarget, dispatch, noteAsset]
  );

  // Persist an edited (or first-painted) image: upload the PNG as a fresh
  // asset (new filename, so nothing caches the old pixels).
  const uploadEdited = useCallback(
    (name: string, dataURI: string): Promise<string> => {
      const safeName = (name || 'image')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');
      return uploadOrEmbed(
        uploadImage,
        `${safeName}_${Date.now()}.png`,
        dataURIToBytes(dataURI),
        'image/png',
        dataURI
      );
    },
    [uploadImage]
  );

  const applyEditorSave = useCallback(
    async (dataURI: string, meta: PixelEditorSaveMeta) => {
      const epoch = sessionEpochRef.current;
      const frameSize: {x: number; y: number} | null =
        await dataURIToSourceSize(dataURI).catch(() => null);

      if (dialogTarget === 'new' && paintNewDraft) {
        const {name, imageType} = paintNewDraft;
        const sourceUrl = await uploadEdited(name, dataURI);
        // The paint may have been canceled (or the dialog moved on) while
        // the upload was out.
        if (persistIsStale(epoch, sourceUrl)) {
          return;
        }
        const key = createNamedAnimation(dispatch, name, {
          sourceUrl,
          frameSize: frameSize || {x: MODEL_OUTPUT_PX, y: MODEL_OUTPUT_PX},
          categories: categoriesForType(imageType),
          ...(imageRole && {role: imageRole}),
          pixelGridSize: meta.pixelGridSize,
          recentColors: meta.recentColors,
        });
        pushAlternative({
          id: createUuid(),
          thumb: await alternativeThumb(dataURI),
          sourceUrl,
          dataURI,
          frameSize,
          pixelGridSize: meta.pixelGridSize,
        });
        noteAsset(sourceUrl);
        setPaintNewDraft(null);
        // A new subject, even though the session continues.
        sessionEpochRef.current++;
        finishNew(key, name, imageType);
        return;
      }

      const props = targetProps;
      const key = dialogTarget;
      if (!key || key === 'new' || !props) {
        return;
      }
      const sourceUrl = await uploadEdited(props.name || 'image', dataURI);
      if (persistIsStale(epoch, sourceUrl)) {
        return;
      }
      const previousUrl = repointAnimation(dispatch, key, {
        sourceUrl,
        dataURI,
        // An edited character strip keeps its frame grid — the editor hands
        // back the same canvas — so only a plain picture takes the measured
        // size (which would otherwise turn the strip into one wide frame).
        ...(frameSize && !props.poses
          ? {frameSize, sourceSize: frameSize}
          : {}),
        pixelGridSize: meta.pixelGridSize,
        // The editor hands back the full canvas, margins and all.
        trimmed: false,
        // Hand-edited pixels are not the prompt's output anymore; drop the
        // stale prompt and seed.
        generation: undefined,
        // Serialized with the animation, so the editor's recent-colors row
        // follows the project.
        recentColors: meta.recentColors,
      });
      const editedFrames = framesFromAnimation(props);
      pushAlternative({
        id: createUuid(),
        thumb: await alternativeThumb(dataURI, editedFrames),
        sourceUrl,
        dataURI,
        frameSize,
        frames: editedFrames,
        pixelGridSize: meta.pixelGridSize,
      });
      noteAsset(sourceUrl);
      // Reclaimed at dialog close, with the rest of the session's leftovers.
      noteAsset(previousUrl);
    },
    [
      finishNew,
      dialogTarget,
      imageRole,
      targetProps,
      paintNewDraft,
      uploadEdited,
      dispatch,
      pushAlternative,
      noteAsset,
      persistIsStale,
    ]
  );

  const handleEditorSave = useCallback(
    async (dataURI: string, meta: PixelEditorSaveMeta) => {
      if (savingPaintRef.current) {
        return;
      }
      savingPaintRef.current = true;
      try {
        await applyEditorSave(dataURI, meta);
      } finally {
        savingPaintRef.current = false;
        // The editor stays up through the save, so the dialog reappears
        // only once the new state is in place — no flash of a stale view.
        setPainting('no');
      }
    },
    [applyEditorSave]
  );

  // The jumbo's picture: the first until one is chosen, a picture made
  // here as soon as it lands, and the first again when the chosen one goes.
  const [chosenKey, setChosenKey] = useState<string | null>(null);
  const knownKeysRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const keys = new Set(images.map(image => image.key));
    const known = knownKeysRef.current;
    knownKeysRef.current = keys;
    const added = known && images.find(image => !known.has(image.key));
    if (added) {
      setChosenKey(added.key);
    }
  }, [images]);
  const chosen =
    images.find(image => image.key === chosenKey) ?? images[0] ?? null;
  const chosenProps = chosen?.props;
  // Character sets are sheets of frames; the editor paints one image.
  const chosenPaintable =
    !!chosen &&
    !chosenProps?.poses &&
    !paintDisabled &&
    !!(chosenProps?.dataURI || chosenProps?.sourceUrl);
  const paintChosen = useCallback(() => {
    if (!chosen) {
      return;
    }
    // The editor saves against the dialog's target.
    setDialogTarget(chosen.key);
    setPaintNewDraft(null);
    savingPaintRef.current = false;
    setPainting('loading');
  }, [chosen]);
  const groups = useMemo<LibraryGroup[]>(() => {
    const byType = new Map<ImageType, LibraryGroup>();
    images.forEach(({key, props}) => {
      const type = imageTypeFromCategories(props?.categories);
      let group = byType.get(type);
      if (!group) {
        group = {type, title: GROUP_TITLES[type], pictures: []};
        byType.set(type, group);
      }
      const src = props?.dataURI || props?.sourceUrl || undefined;
      group.pictures.push({
        key,
        name: props?.name,
        thumb: getImageThumbnail(props?.name) || src,
        src,
        pixelated: !!props?.pixelGridSize,
        sheet:
          props?.poses && src
            ? {src, frameSize: props.frameSize, poses: props.poses}
            : undefined,
      });
    });
    return [...byType.values()];
  }, [images]);

  const creating = dialogTarget === 'new';
  // Backgrounds paint over the stage's opaque ground instead of
  // transparency; they must stay fully opaque.
  const paintedType =
    creating && paintNewDraft
      ? paintNewDraft.imageType
      : imageTypeFromCategories(targetProps?.categories);
  // The details dialog opens for a new picture or a pick; a chosen picture
  // shows in the jumbo instead, and paints straight into the editor.
  const detailsDialogShown = creating || !!pickRequest;
  return (
    <div className={moduleStyles.imagesManager}>
      <PictureLibrary
        groups={groups}
        chosenKey={chosen?.key ?? null}
        onChoose={setChosenKey}
        onNew={openNewDialog}
        onPaint={chosenPaintable ? paintChosen : undefined}
        onDelete={chosen ? () => deleteImage(chosen.key) : undefined}
        jumboSide={jumboSide}
      />

      {detailsDialogShown && dialogTarget && painting !== 'active' && (
        <ImageDetailsDialog
          // Keyed by subject: when a paint-save turns 'new' into a real
          // image, the dialog remounts and opens on the summary view.
          key={dialogTarget}
          animKey={creating ? null : dialogTarget}
          name={targetProps?.name}
          thumb={
            // The dialog is the full-resolution view; the small gallery
            // thumbnail only stands in until the image's data arrives.
            creating
              ? undefined
              : targetProps?.dataURI ||
                getImageThumbnail(targetProps?.name || '') ||
                targetProps?.sourceUrl ||
                undefined
          }
          generation={targetProps?.generation}
          sheet={
            !creating && targetProps?.poses
              ? {
                  src: targetProps.dataURI || targetProps.sourceUrl || '',

                  frameSize: targetProps.frameSize,

                  poses: targetProps.poses,
                }
              : undefined
          }
          onClose={closeDialog}
          onPaint={() => {
            savingPaintRef.current = false;
            setPainting('loading');
          }}
          onPaintNew={handlePaintNew}
          newImageDraft={paintNewDraft ?? undefined}
          onRename={handleRename}
          onDelete={handleDelete}
          imageType={imageTypeFromCategories(targetProps?.categories)}
          lockedImageType={lockedImageType}
          lockedImageSubject={lockedImageSubject}
          // No seed means the session started from nothing; any image
          // differs from that.
          imageChanged={
            !!targetProps?.sourceUrl && targetProps.sourceUrl !== seedSourceUrl
          }
          advanced={advanced}
          defaultStyle={defaultStyle}
          paintDisabled={paintDisabled}
          pixelated={!!(targetProps?.pixelGridSize ?? detectedGridSize)}
          // A sheet's resolution is its frame: the image the pane shows.
          resolution={creating ? undefined : targetProps?.frameSize}
          pixelGridSize={targetProps?.pixelGridSize ?? detectedGridSize}
          getDataURI={getTargetDataURI}
          isNameTaken={isNameTaken}
          onGenerateStart={handleGenerateStart}
          onAcceptGenerated={handleAcceptGenerated}
          alternatives={alternatives.map(
            (alt): AlternativeImage => ({
              id: alt.id,
              thumb: alt.thumb,
              selected: alt.sourceUrl === targetProps?.sourceUrl,
            })
          )}
          onSelectAlternative={handleSelectAlternative}
        />
      )}

      {dialogTarget && painting !== 'no' && (
        <PixelEditorModal
          title={
            creating && paintNewDraft
              ? advanced
                ? `Paint ${paintNewDraft.name}`
                : 'Paint image'
              : advanced
              ? `Edit ${targetProps?.name ?? 'image'}`
              : 'Edit image'
          }
          // Edit the original, untrimmed pixels; a brand-new image starts
          // on a blank canvas sized for its style.
          imageUrl={
            creating && blankPaint
              ? blankPaint.dataURI
              : targetProps?.dataURI || targetProps?.sourceUrl || ''
          }
          // Recorded at generation time; images without it (legacy, smooth
          // style) edit at native resolution.
          knownPixelGrid={
            creating && blankPaint
              ? blankPaint.pixelGridSize
              : targetProps?.pixelGridSize
          }
          initialRecentColors={creating ? undefined : targetProps?.recentColors}
          opaqueGround={
            paintedType === 'background' ? BACKGROUND_GROUND_COLOR : undefined
          }
          onReady={() => setPainting('active')}
          onSave={handleEditorSave}
          onCancel={() => {
            // Orphan a save still uploading: canceled means not applied.
            sessionEpochRef.current++;
            setPainting('no');
          }}
        />
      )}
    </div>
  );
};

export default GenerateImagePane;
