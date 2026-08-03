import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import {UploadImageFunction} from '../ai/items/itemGeneration';
import {
  getTrimmedThumbnail,
  onTrimsUpdated,
  trimAnimationListImages,
} from '../imageTrim';
import {
  BACKGROUNDS_CATEGORY,
  BLOCKS_CATEGORY,
  SpriteLab2ItemType,
} from '../types';

import {GeneratedImageResult} from './GenerateImageView';
import ImageDetailsDialog from './ImageDetailsDialog';

import moduleStyles from './sprite-lab2-view.module.scss';

// A new image starts as a blank, transparent, pixel-editable canvas: 32x32
// art pixels drawn at 16 physical px each (the generation pipeline's block
// size).
const BLANK_CANVAS_PX = 512;
const BLANK_CANVAS_GRID = 16;
let blankCanvasDataURI: string | null = null;
function getBlankCanvasDataURI(): string {
  if (!blankCanvasDataURI) {
    const canvas = document.createElement('canvas');
    canvas.width = BLANK_CANVAS_PX;
    canvas.height = BLANK_CANVAS_PX;
    blankCanvasDataURI = canvas.toDataURL('image/png');
  }
  return blankCanvasDataURI;
}

function itemTypeFromCategories(categories?: string[]): SpriteLab2ItemType {
  if (categories?.includes(BACKGROUNDS_CATEGORY)) {
    return 'background';
  }
  if (categories?.includes(BLOCKS_CATEGORY)) {
    return 'block';
  }
  return 'sprite';
}

function bytesToDataURI(bytes: Uint8Array, mediaType: string): string {
  let binary = '';
  // Chunked: spreading a megabyte-scale array overflows the argument limit.
  for (let i = 0; i < bytes.length; i += 32768) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  return `data:${mediaType};base64,${btoa(binary)}`;
}

interface GalleryCardProps {
  animKey: string;
  name?: string;
  thumb?: string;
  onOpen: (key: string, trigger: HTMLElement) => void;
}

// Memoized: opening/closing the dialog re-renders the pane, and without this
// every card (thumbnail img and all) re-renders with it. The thumb string is
// computed by the parent so trim updates still flow through as a changed
// prop.
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

/**
 * The Images tab: the project's image gallery. Clicking an image (or the
 * new-image card) opens the image dialog; painting happens from there.
 */
const GenerateImagePane: React.FunctionComponent<{
  uploadImage?: UploadImageFunction;
  /** Rename an image and every reference to it; error message or null. */
  onRenameImage: (oldName: string, newName: string) => string | null;
}> = ({uploadImage, onRenameImage}) => {
  const dispatch = useAppDispatch();

  // The project's images live in the animation list (AI-generated images are
  // bridged in there); this view is also how you manage them.
  const images = useAppSelector(state =>
    state.animationList.orderedKeys.map(key => ({
      key,
      props: state.animationList.propsByKey[key],
    }))
  );

  // Gallery thumbnails prefer the border-trimmed image (backgrounds aren't
  // trimmed and fall through). Trims land as the engine preloads; re-render
  // when they do.
  const [, setTrimVersion] = useState(0);
  useEffect(() => onTrimsUpdated(() => setTrimVersion(v => v + 1)), []);

  // Compute trims for images added after the initial load (a fresh
  // generation lands here before any engine preload runs). The pass is
  // source-cached, so only new images do work.
  const animationList = useAppSelector(state => state.animationList);
  useEffect(() => {
    trimAnimationListImages(animationList);
  }, [animationList]);

  // The dialog's subject: an animation key, 'new', or closed. Painting is
  // three-way: the details dialog stays up through 'loading' (the paint
  // editor renders nothing until its image decodes) and hands off in one
  // step when the editor reports ready — otherwise the backdrop vanishes
  // for a moment between the two dialogs.
  const [dialogTarget, setDialogTarget] = useState<string | 'new' | null>(null);
  const [painting, setPainting] = useState<'no' | 'loading' | 'active'>('no');
  // The name chosen for a new image, held until its first paint is saved —
  // nothing is created before that.
  const pendingNewNameRef = useRef<string | null>(null);
  // The gallery card that opened the dialog; focus returns to it on close.
  const triggerRef = useRef<HTMLElement | null>(null);

  const openDialog = useCallback((key: string, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setDialogTarget(key);
  }, []);

  const openNewDialog = useCallback((event: React.MouseEvent<HTMLElement>) => {
    triggerRef.current = event.currentTarget;
    setDialogTarget('new');
  }, []);

  const closeDialog = useCallback(() => {
    setDialogTarget(null);
    setPainting('no');
    pendingNewNameRef.current = null;
    triggerRef.current?.focus();
  }, []);

  const targetProps =
    dialogTarget && dialogTarget !== 'new'
      ? images.find(i => i.key === dialogTarget)?.props
      : undefined;

  const handleDelete = useCallback(() => {
    if (dialogTarget && dialogTarget !== 'new') {
      dispatch(
        // deleteAnimation is an untyped JS thunk; cast for dispatch.
        deleteAnimation(
          dialogTarget,
          true /* isSpriteLab */
        ) as unknown as AnyAction
      );
    }
    closeDialog();
  }, [dispatch, dialogTarget, closeDialog]);

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

  const handleCreateFromPaint = useCallback(
    (name: string): string | null => {
      if (!name || isNameTaken(name)) {
        return name ? 'That name is already used.' : 'Enter a name first.';
      }
      pendingNewNameRef.current = name;
      setPainting('loading');
      return null;
    },
    [isNameTaken]
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
      const blob = await (await fetch(targetProps.sourceUrl)).blob();
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

      if (dialogTarget === 'new' && newName) {
        const key = createUuid();
        dispatch(
          // addAnimation is an untyped JS thunk; cast for dispatch.
          addAnimation(key, {
            name: newName,
            sourceUrl,
            frameSize: frameSize || {x: 1024, y: 1024},
            frameCount: 1,
            frameDelay: 2,
            looping: true,
            categories:
              result.generation.itemType === 'background'
                ? [BACKGROUNDS_CATEGORY]
                : result.generation.itemType === 'block'
                ? [BLOCKS_CATEGORY]
                : [],
            pixelGridSize: result.pixelGridSize,
            generation: result.generation,
          }) as unknown as AnyAction
        );
        // The classic thunk unconditionally renames to name_N; take the
        // plain name back (validated free before entering the view).
        if (
          isNameUnique(newName, getStore().getState().animationList.propsByKey)
        ) {
          dispatch(setAnimationName(key, newName) as unknown as AnyAction);
        }
        setDialogTarget(key);
        return;
      }

      const key = dialogTarget;
      if (!key || key === 'new' || !targetProps) {
        return;
      }
      const current = getStore().getState().animationList;
      const updated = {
        orderedKeys: current.orderedKeys,
        propsByKey: {
          ...current.propsByKey,
          [key]: {
            ...current.propsByKey[key],
            sourceUrl,
            dataURI,
            ...(frameSize ? {frameSize, sourceSize: frameSize} : {}),
            pixelGridSize: result.pixelGridSize,
            generation: result.generation,
            loadedFromSource: true,
            saved: false,
          },
        },
      };
      dispatch({type: SET_INITIAL_ANIMATION_LIST, animationList: updated});
      trimAnimationListImages(updated);
    },
    [dialogTarget, targetProps, uploadImage, dispatch]
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

  const handleEditorSave = useCallback(
    async (dataURI: string, meta: PixelEditorSaveMeta) => {
      setPainting('no');
      const frameSize: {x: number; y: number} | null =
        await dataURIToSourceSize(dataURI).catch(() => null);

      // First paint of a new image: create its animation now.
      const newName = pendingNewNameRef.current;
      if (dialogTarget === 'new' && newName) {
        pendingNewNameRef.current = null;
        const sourceUrl = await uploadEdited(newName, dataURI);
        const key = createUuid();
        dispatch(
          // addAnimation is an untyped JS thunk; cast for dispatch.
          addAnimation(key, {
            name: newName,
            sourceUrl,
            frameSize: frameSize || {x: BLANK_CANVAS_PX, y: BLANK_CANVAS_PX},
            frameCount: 1,
            frameDelay: 2,
            looping: true,
            categories: [],
            pixelGridSize: meta.pixelGridSize,
            recentColors: meta.recentColors,
          }) as unknown as AnyAction
        );
        // The classic thunk unconditionally renames to name_N; take the
        // plain name back (validated free in handleCreateFromPaint).
        if (
          isNameUnique(newName, getStore().getState().animationList.propsByKey)
        ) {
          dispatch(setAnimationName(key, newName) as unknown as AnyAction);
        }
        setDialogTarget(key);
        return;
      }

      const props = targetProps;
      const key = dialogTarget;
      if (!key || key === 'new' || !props) {
        return;
      }
      const sourceUrl = await uploadEdited(props.name || 'image', dataURI);
      // Update via the raw list-replace action rather than editAnimation:
      // the classic EDIT_ANIMATION reducer forces sourceUrl to null (it
      // expects the legacy animation-save service to upload later), which
      // would strand the edit in memory — Lab2 sources persist sourceUrl,
      // not dataURI.
      const current = getStore().getState().animationList;
      const updated = {
        orderedKeys: current.orderedKeys,
        propsByKey: {
          ...current.propsByKey,
          [key]: {
            ...current.propsByKey[key],
            sourceUrl,
            dataURI,
            ...(frameSize ? {frameSize, sourceSize: frameSize} : {}),
            pixelGridSize: meta.pixelGridSize,
            // Serialized with the animation, so the editor's recent-colors
            // row follows the project.
            recentColors: meta.recentColors,
            loadedFromSource: true,
            saved: false,
          },
        },
      };
      dispatch({type: SET_INITIAL_ANIMATION_LIST, animationList: updated});
      // Recompute this image's trimmed thumbnail (cached by source; fires
      // onTrimsUpdated, refreshing the gallery and block dropdowns).
      trimAnimationListImages(updated);
    },
    [dialogTarget, targetProps, uploadEdited, dispatch]
  );

  const creating = dialogTarget === 'new';
  return (
    <div className={moduleStyles.imagesManager}>
      <div className={moduleStyles.imageGallery}>
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
      </div>

      {dialogTarget && painting !== 'active' && (
        <ImageDetailsDialog
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
          onPaint={() => setPainting('loading')}
          onCreateFromPaint={handleCreateFromPaint}
          onRename={handleRename}
          onDelete={handleDelete}
          itemType={itemTypeFromCategories(targetProps?.categories)}
          getDataURI={getTargetDataURI}
          isNameTaken={isNameTaken}
          onAcceptGenerated={handleAcceptGenerated}
        />
      )}

      {dialogTarget && painting !== 'no' && (
        <PixelEditorModal
          title={
            creating
              ? `Paint ${pendingNewNameRef.current}`
              : `Edit ${targetProps?.name}`
          }
          // Edit the ORIGINAL image (untrimmed): trims are a display-time
          // optimization; the animation's pixels are the source of truth.
          imageUrl={
            creating
              ? getBlankCanvasDataURI()
              : targetProps?.dataURI || targetProps?.sourceUrl || ''
          }
          // Recorded at generation time; images without it (legacy, smooth
          // style) edit at native resolution.
          knownPixelGrid={
            creating ? BLANK_CANVAS_GRID : targetProps?.pixelGridSize
          }
          initialRecentColors={targetProps?.recentColors}
          onReady={() => setPainting('active')}
          onSave={handleEditorSave}
          onCancel={() => setPainting('no')}
        />
      )}
    </div>
  );
};

export default GenerateImagePane;
