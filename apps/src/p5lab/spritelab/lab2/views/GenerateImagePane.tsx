import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnyAction} from 'redux';

import {dataURIToSourceSize} from '@cdo/apps/imageUtils';
import {
  addAnimation,
  deleteAnimation,
  isNameUnique,
  setAnimationName,
  SET_INITIAL_ANIMATION_LIST,
} from '@cdo/apps/p5lab/redux/animationList';
import PixelEditorModal, {
  PixelEditorSaveMeta,
} from '@cdo/apps/pixelEditor/PixelEditorModal';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import {
  GeneratedImageResult,
  UploadImageFunction,
} from '../ai/images/imageGeneration';
import {MODEL_OUTPUT_PX} from '../ai/images/modelHelpers';
import {ImageGenerationMetadata, ImageType} from '../ai/images/types';
import {
  categoriesForType,
  galleryOrder,
  imageTypeFromCategories,
} from '../imageGallery';
import {
  forgetTrimmedThumbnail,
  getTrimmedThumbnail,
  onTrimsUpdated,
  trimAnimationListImages,
} from '../imageTrim';
import {BACKGROUND_GROUND_COLOR, blankPaintImage} from '../paintBlank';

import type {NewImageDraft} from './GenerateImageView';
import ImageDetailsDialog, {AlternativeImage} from './ImageDetailsDialog';
import {alternativeFromAnimation, useImageSession} from './useImageSession';

import moduleStyles from './sprite-lab2-view.module.scss';

function bytesToDataURI(bytes: Uint8Array, mediaType: string): string {
  let binary = '';
  // Chunked: spreading a megabyte-scale array overflows the argument limit.
  for (let i = 0; i < bytes.length; i += 32768) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  return `data:${mediaType};base64,${btoa(binary)}`;
}

type Dispatch = ReturnType<typeof useAppDispatch>;

// The animation fields the dialog's persist paths write. An explicit
// `undefined` clears the field (the spread keeps the key).
interface AnimationPatch {
  sourceUrl?: string;
  dataURI?: string;
  frameSize?: {x: number; y: number};
  sourceSize?: {x: number; y: number};
  categories?: string[];
  pixelGridSize?: number;
  generation?: ImageGenerationMetadata;
  recentColors?: PixelEditorSaveMeta['recentColors'];
}

/**
 * Create an animation under a name callers have already validated as free,
 * and return its key. The classic addAnimation thunk always renames to
 * name_N; the plain name is set back afterwards.
 */
function createNamedAnimation(
  dispatch: Dispatch,
  name: string,
  props: AnimationPatch
): string {
  const key = createUuid();
  dispatch(
    // addAnimation is an untyped JS thunk; cast for dispatch.
    addAnimation(key, {
      name,
      frameCount: 1,
      frameDelay: 2,
      looping: true,
      ...props,
    }) as unknown as AnyAction
  );
  if (isNameUnique(name, getStore().getState().animationList.propsByKey)) {
    dispatch(setAnimationName(key, name) as unknown as AnyAction);
  }
  return key;
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

interface GalleryCardProps {
  animKey: string;
  name?: string;
  thumb?: string;
  onOpen: (key: string, trigger: HTMLElement) => void;
}

// Memoized: opening or closing the dialog re-renders the pane, and every
// card would re-render with it. Thumbnail updates arrive as a changed prop.
const GalleryCard = React.memo<GalleryCardProps>(
  ({animKey, name, thumb, onOpen}) => (
    <div className={moduleStyles.imageCard}>
      <button
        type="button"
        className={moduleStyles.imageThumb}
        title={name}
        onClick={event => onOpen(animKey, event.currentTarget)}
      >
        {thumb && <img src={thumb} alt={name || 'image'} />}
      </button>
      <div className={moduleStyles.imageName} title={name}>
        {name}
      </div>
    </div>
  )
);
GalleryCard.displayName = 'GalleryCard';

interface GenerateImagePaneProps {
  uploadImage?: UploadImageFunction;
  /** Rename an image and every reference to it; error message or null. */
  onRenameImage: (oldName: string, newName: string) => string | null;
  /** Level-imposed type for new images. */
  lockedImageType?: ImageType;
}

/**
 * The Images tab: the project's image gallery. Clicking an image (or the
 * new-image card) opens the image dialog; painting happens from there.
 */
const GenerateImagePane: React.FunctionComponent<GenerateImagePaneProps> = ({
  uploadImage,
  onRenameImage,
  lockedImageType,
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

  const openDialog = useCallback(
    (key: string, trigger: HTMLElement) => {
      sessionEpochRef.current++;
      triggerRef.current = trigger;
      setDialogTarget(key);
      setPaintNewDraft(null);
      resetSession(
        alternativeFromAnimation(
          getStore().getState().animationList.propsByKey[key]
        )
      );
    },
    [resetSession]
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

  const closeDialog = useCallback(() => {
    sessionEpochRef.current++;
    setDialogTarget(null);
    setPainting('no');
    setPaintNewDraft(null);
    endSession();
    triggerRef.current?.focus();
  }, [endSession]);

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

  const handleDelete = useCallback(() => {
    if (dialogTarget && dialogTarget !== 'new') {
      const removedUrl =
        getStore().getState().animationList.propsByKey[dialogTarget]?.sourceUrl;
      dispatch(
        // deleteAnimation is an untyped JS thunk; cast for dispatch.
        deleteAnimation(
          dialogTarget,
          true /* isSpriteLab */
        ) as unknown as AnyAction
      );
      // The removal already happened; reclaim the asset if unreferenced now.
      deleteUnreferencedAsset(removedUrl);
    }
    closeDialog();
  }, [dispatch, dialogTarget, closeDialog, deleteUnreferencedAsset]);

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
  // them in a JSON request body).
  const getTargetDataURI = useCallback(async (): Promise<string | null> => {
    if (!targetProps) {
      return null;
    }
    if (targetProps.dataURI) {
      return targetProps.dataURI;
    }
    if (!targetProps.sourceUrl) {
      return null;
    }
    try {
      const blob = await (await HttpClient.get(targetProps.sourceUrl)).blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
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
      let sourceUrl = dataURI;
      if (uploadImage) {
        try {
          sourceUrl = await uploadImage(
            result.filename,
            result.uint8Array,
            result.mediaType
          );
        } catch {
          // Keep the embedded data URI.
        }
      }
      const frameSize: {x: number; y: number} | null =
        await dataURIToSourceSize(dataURI).catch(() => null);
      if (persistIsStale(epoch, sourceUrl)) {
        return;
      }

      pushAlternative({
        id: createUuid(),
        thumb: dataURI,
        sourceUrl,
        dataURI,
        frameSize,
        pixelGridSize: result.pixelGridSize,
        generation: result.generation,
      });
      noteAsset(sourceUrl);

      if (dialogTarget === 'new' && newName) {
        const key = createNamedAnimation(dispatch, newName, {
          sourceUrl,
          frameSize: frameSize || {x: MODEL_OUTPUT_PX, y: MODEL_OUTPUT_PX},
          categories: categoriesForType(result.generation.imageType),
          pixelGridSize: result.pixelGridSize,
          generation: result.generation,
        });
        // A new subject, even though the session continues.
        sessionEpochRef.current++;
        setDialogTarget(key);
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
        pixelGridSize: result.pixelGridSize,
        generation: result.generation,
      });
      // The superseded asset stays until the dialog closes: it's in the
      // Alternatives strip and may become the image again.
      noteAsset(previousUrl);
    },
    [
      dialogTarget,
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
        forgetTrimmedThumbnail(
          getStore().getState().animationList.propsByKey[key]?.name
        );
      }
      const previousUrl = repointAnimation(dispatch, key, {
        sourceUrl: alt.sourceUrl,
        dataURI: alt.dataURI,
        ...(alt.frameSize
          ? {frameSize: alt.frameSize, sourceSize: alt.frameSize}
          : {}),
        pixelGridSize: alt.pixelGridSize,
        generation: alt.generation,
      });
      noteAsset(previousUrl);
    },
    [alternatives, dialogTarget, dispatch, noteAsset]
  );

  // Persist an edited (or first-painted) image: upload the PNG as a fresh
  // asset (new filename, so nothing caches the old pixels).
  const uploadEdited = useCallback(
    async (name: string, dataURI: string): Promise<string> => {
      if (!uploadImage) {
        // With nowhere to upload, the dataURI itself is stored as the
        // source, which persists in project sources.
        return dataURI;
      }
      try {
        const base64 = dataURI.split(',')[1];
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const safeName = (name || 'image')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_');
        return await uploadImage(
          `${safeName}_${Date.now()}.png`,
          bytes,
          'image/png'
        );
      } catch {
        return dataURI;
      }
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
        // The paint may have been cancelled (or the dialog moved on) while
        // the upload was out.
        if (persistIsStale(epoch, sourceUrl)) {
          return;
        }
        const key = createNamedAnimation(dispatch, name, {
          sourceUrl,
          frameSize: frameSize || {x: MODEL_OUTPUT_PX, y: MODEL_OUTPUT_PX},
          categories: categoriesForType(imageType),
          pixelGridSize: meta.pixelGridSize,
          recentColors: meta.recentColors,
        });
        pushAlternative({
          id: createUuid(),
          thumb: dataURI,
          sourceUrl,
          dataURI,
          frameSize,
          pixelGridSize: meta.pixelGridSize,
        });
        noteAsset(sourceUrl);
        setPaintNewDraft(null);
        // A new subject, even though the session continues.
        sessionEpochRef.current++;
        setDialogTarget(key);
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
        ...(frameSize ? {frameSize, sourceSize: frameSize} : {}),
        pixelGridSize: meta.pixelGridSize,
        // Hand-edited pixels are not the prompt's output anymore; drop the
        // stale prompt and seed.
        generation: undefined,
        // Serialized with the animation, so the editor's recent-colors row
        // follows the project.
        recentColors: meta.recentColors,
      });
      pushAlternative({
        id: createUuid(),
        thumb: dataURI,
        sourceUrl,
        dataURI,
        frameSize,
        pixelGridSize: meta.pixelGridSize,
      });
      noteAsset(sourceUrl);
      // Reclaimed at dialog close, with the rest of the session's leftovers.
      noteAsset(previousUrl);
    },
    [
      dialogTarget,
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

  const creating = dialogTarget === 'new';
  // Backgrounds paint over the stage's opaque ground instead of
  // transparency; they must stay fully opaque.
  const paintedType =
    creating && paintNewDraft
      ? paintNewDraft.imageType
      : imageTypeFromCategories(targetProps?.categories);
  return (
    <div className={moduleStyles.imagesManager}>
      <div className={moduleStyles.imageGallery}>
        {/* First slot, so it never hides behind a scroll. */}
        <div className={moduleStyles.imageCard}>
          <button
            type="button"
            className={moduleStyles.newImageCard}
            onClick={openNewDialog}
          >
            <span aria-hidden>+</span>
            <span className={moduleStyles.newImageLabel}>New image</span>
          </button>
        </div>
        {images.map(({key, props}) => (
          <GalleryCard
            key={key}
            animKey={key}
            name={props?.name}
            thumb={
              getTrimmedThumbnail(props?.name) ||
              props?.dataURI ||
              props?.sourceUrl ||
              undefined
            }
            onOpen={openDialog}
          />
        ))}
      </div>

      {dialogTarget && painting !== 'active' && (
        <ImageDetailsDialog
          // Keyed by subject: when a paint-save turns 'new' into a real
          // image, the dialog remounts and opens on the summary view.
          key={dialogTarget}
          animKey={creating ? null : dialogTarget}
          name={targetProps?.name}
          thumb={
            creating
              ? undefined
              : getTrimmedThumbnail(targetProps?.name || '') ||
                targetProps?.dataURI ||
                targetProps?.sourceUrl ||
                undefined
          }
          generation={targetProps?.generation}
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
              ? `Paint ${paintNewDraft.name}`
              : `Edit ${targetProps?.name}`
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
            // Orphan a save still uploading: cancelled means not applied.
            sessionEpochRef.current++;
            setPainting('no');
          }}
        />
      )}
    </div>
  );
};

export default GenerateImagePane;
