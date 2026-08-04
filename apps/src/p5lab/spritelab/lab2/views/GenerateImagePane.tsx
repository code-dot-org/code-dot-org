import React, {useCallback, useEffect, useState} from 'react';
import {AnyAction} from 'redux';

import {dataURIToSourceSize} from '@cdo/apps/imageUtils';
import {
  deleteAnimation,
  SET_INITIAL_ANIMATION_LIST,
} from '@cdo/apps/p5lab/redux/animationList';
import PixelEditorModal, {
  PixelEditorSaveMeta,
} from '@cdo/apps/pixelEditor/PixelEditorModal';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {UploadImageFunction} from '../ai/items/itemGeneration';
import {
  getTrimmedThumbnail,
  onTrimsUpdated,
  trimAnimationListImages,
} from '../imageTrim';

import moduleStyles from './sprite-lab2-view.module.scss';

interface GalleryCardProps {
  animKey: string;
  name?: string;
  thumb?: string;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
}

// Memoized: opening/closing the editor modal re-renders the pane, and
// without this every card (thumbnail img and all) re-renders with it —
// most of dev-mode's click-to-modal latency. The thumb string is computed
// by the parent so trim updates still flow through as a changed prop.
const GalleryCard = React.memo<GalleryCardProps>(
  ({animKey, name, thumb, onEdit, onDelete}) => (
    <div className={moduleStyles.imageCard}>
      <button
        type="button"
        className={moduleStyles.imageThumb}
        title={`Edit ${name || 'image'}`}
        onClick={() => onEdit(animKey)}
      >
        {thumb && <img src={thumb} alt={name || 'image'} />}
      </button>
      <div className={moduleStyles.imageName} title={name}>
        {name}
      </div>
      <button
        type="button"
        className={moduleStyles.deleteButton}
        onClick={() => onDelete(animKey)}
      >
        Delete
      </button>
    </div>
  )
);
GalleryCard.displayName = 'GalleryCard';

/**
 * The Images tab: the project's image gallery (delete, click-to-edit via the pixel editor).
 */
const GenerateImagePane: React.FunctionComponent<{
  uploadImage?: UploadImageFunction;
}> = ({uploadImage}) => {
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

  // The channel is only needed to recognize this project's own asset URLs;
  // uploads go through the uploadImage seam.
  const channelId = useAppSelector(state => state.lab.channel?.id);

  // Reclaim a superseded image asset. Guards keep it safe: only this
  // project's own uploaded assets (never library images, absolute URLs,
  // inline dataURIs, or level starter assets), and only when no image still
  // points at it (a duplicate can share one). Best-effort — a failed cleanup
  // never disrupts the edit or delete. Known tradeoff: restoring an older
  // project version shows a broken image for anything deleted since (as in
  // App Lab).
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

  const handleDelete = useCallback(
    (key: string) => {
      const removedUrl =
        getStore().getState().animationList.propsByKey[key]?.sourceUrl;
      dispatch(
        // deleteAnimation is an untyped JS thunk; cast for dispatch.
        deleteAnimation(key, true /* isSpriteLab */) as unknown as AnyAction
      );
      // The removal already happened; reclaim the asset if unreferenced now.
      deleteUnreferencedAsset(removedUrl);
    },
    [dispatch, deleteUnreferencedAsset]
  );

  // Pixel editor: clicking a gallery image opens it in the modal; Save
  // uploads the edited PNG as a fresh asset (new filename, so nothing caches
  // the old pixels) and points the animation at it. With nowhere to upload,
  // the dataURI itself is stored as the source, which persists in project
  // sources.
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const editingProps = editingKey
    ? images.find(i => i.key === editingKey)?.props
    : undefined;
  const handleEdit = useCallback((key: string) => setEditingKey(key), []);

  const handleEditorSave = useCallback(
    async (dataURI: string, meta: PixelEditorSaveMeta) => {
      const key = editingKey;
      const props = editingProps;
      setEditingKey(null);
      if (!key || !props) {
        return;
      }
      // The asset this edit replaces; cleaned up once the new one is in place.
      const previousUrl = props.sourceUrl;
      // Pixel-art edits can change resolution (logical downsample + crisp
      // upscale); keep the animation's frame metadata truthful.
      const frameSize: {x: number; y: number} | null =
        await dataURIToSourceSize(dataURI).catch(() => null);
      let sourceUrl = dataURI;
      if (uploadImage) {
        try {
          const base64 = dataURI.split(',')[1];
          const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          const safeName = (props.name || 'image')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_');
          sourceUrl = await uploadImage(
            `${safeName}_${Date.now()}.png`,
            bytes,
            'image/png'
          );
        } catch {
          // Fall back to embedding the dataURI as the source.
        }
      }
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
      // The image now points at the fresh asset; drop the old one.
      deleteUnreferencedAsset(previousUrl);
    },
    [editingKey, editingProps, uploadImage, dispatch, deleteUnreferencedAsset]
  );

  return (
    <div className={moduleStyles.imagesManager}>
      <div className={moduleStyles.imageGallery}>
        {images.length === 0 && (
          <div className={moduleStyles.galleryEmpty}>
            No images yet. Generate one in the panel below to use it in your
            code.
          </div>
        )}
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
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editingProps && (
        <PixelEditorModal
          title={`Edit ${editingProps.name}`}
          // Edit the ORIGINAL image (untrimmed): trims are a display-time
          // optimization; the animation's pixels are the source of truth.
          imageUrl={editingProps.dataURI || editingProps.sourceUrl || ''}
          // Recorded at generation time; images without it (legacy, smooth
          // style) edit at native resolution.
          knownPixelGrid={editingProps.pixelGridSize}
          initialRecentColors={editingProps.recentColors}
          onSave={handleEditorSave}
          onCancel={() => setEditingKey(null)}
        />
      )}
    </div>
  );
};

export default GenerateImagePane;
