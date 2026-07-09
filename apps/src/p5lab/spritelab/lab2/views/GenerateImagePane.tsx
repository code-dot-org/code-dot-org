import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';
import {AnyAction} from 'redux';

import {
  addAnimation,
  deleteAnimation,
  SET_INITIAL_ANIMATION_LIST,
} from '@cdo/apps/p5lab/redux/animationList';
import PixelEditorModal from '@cdo/apps/pixelEditor/PixelEditorModal';
import {getStore} from '@cdo/apps/redux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import {
  generateImage,
  SpriteLab2ItemStyle,
  SpriteLab2ItemType,
  uploadAssetToProject,
} from '../ai/items/itemGeneration';
import {
  getTrimmedThumbnail,
  onTrimsUpdated,
  trimAnimationListImages,
} from '../imageTrim';
import {BACKGROUNDS_CATEGORY} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

// Read an image's pixel dimensions so the animation's frameSize matches the
// generated PNG (single frame).
function getImageSize(
  data: Uint8Array,
  mediaType: string
): Promise<{x: number; y: number}> {
  return new Promise(resolve => {
    const buffer = new Uint8Array(data).buffer as ArrayBuffer;
    const blob = new Blob([buffer], {type: mediaType});
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({x: img.naturalWidth, y: img.naturalHeight});
    };
    img.onerror = () => resolve({x: 100, y: 100});
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * AI image-generation pane for the Items tab. Generates a sprite or background
 * from a text prompt (gemini-2.5-flash-image), uploads it to the project's
 * asset bucket, and bridges it into the Sprite Lab animation list so it becomes
 * an ordinary costume/background usable by the runtime and the block dropdowns.
 */
const GenerateImagePane: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const channelId = useAppSelector(state => state.lab.channel?.id);

  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [itemType, setItemType] = useState<SpriteLab2ItemType>('sprite');
  const [style, setStyle] = useState<SpriteLab2ItemStyle>('smooth');
  const [status, setStatus] = useState<'idle' | 'generating'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Enter a description first.');
      return;
    }
    if (!channelId) {
      setError(
        'This project has no channel yet, so generated images can’t be saved.'
      );
      return;
    }
    setStatus('generating');
    setError(null);
    try {
      const {filename, uint8Array, mediaType} = await generateImage(
        prompt,
        itemType,
        style
      );
      const url = await uploadAssetToProject(
        channelId,
        filename,
        uint8Array,
        mediaType
      );
      const frameSize = await getImageSize(uint8Array, mediaType);
      // Bridge into the animation list: addAnimation fetches sourceUrl, builds
      // the dataURI, and (for Sprite Lab) inserts at the top of the list.
      dispatch(
        // addAnimation is an untyped JS thunk (inferred as Function); cast so
        // the dispatch overloads accept it. redux-thunk runs the function.
        addAnimation(createUuid(), {
          name: name.trim() || prompt.trim().slice(0, 20),
          sourceUrl: url,
          frameSize,
          frameCount: 1,
          frameDelay: 2,
          looping: true,
          categories: itemType === 'background' ? [BACKGROUNDS_CATEGORY] : [],
        }) as unknown as AnyAction
      );
      setName('');
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStatus('idle');
    }
  }, [prompt, name, itemType, style, channelId, dispatch]);

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

  const handleDelete = useCallback(
    (key: string) => {
      dispatch(
        // deleteAnimation is an untyped JS thunk; cast for dispatch.
        deleteAnimation(key, true /* isSpriteLab */) as unknown as AnyAction
      );
    },
    [dispatch]
  );

  // Pixel editor: clicking a gallery image opens it in the modal; Save
  // uploads the edited PNG as a fresh project asset (new filename, so
  // nothing caches the old pixels) and points the animation at it. Without
  // a channel the dataURI itself is stored as the source, which persists in
  // project sources.
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const editingProps = editingKey
    ? images.find(i => i.key === editingKey)?.props
    : undefined;

  const handleEditorSave = useCallback(
    async (dataURI: string) => {
      const key = editingKey;
      const props = editingProps;
      setEditingKey(null);
      if (!key || !props) {
        return;
      }
      let sourceUrl = dataURI;
      if (channelId) {
        try {
          const base64 = dataURI.split(',')[1];
          const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          const safeName = (props.name || 'image')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_');
          sourceUrl = await uploadAssetToProject(
            channelId,
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
    [editingKey, editingProps, channelId, dispatch]
  );

  const generating = status === 'generating';

  return (
    <div className={moduleStyles.imagesManager}>
      <div className={moduleStyles.generatePane}>
        <strong className={moduleStyles.generateHeading}>
          Generate an image with AI
        </strong>
        <div className={moduleStyles.fieldRow}>
          <label
            className={classNames(moduleStyles.field, moduleStyles.fieldGrow)}
          >
            <span>Name</span>
            <input
              type="text"
              value={name}
              placeholder="e.g. hero"
              onChange={e => setName(e.target.value)}
              disabled={generating}
            />
          </label>
          <label className={moduleStyles.field}>
            <span>Type</span>
            <select
              value={itemType}
              onChange={e => setItemType(e.target.value as SpriteLab2ItemType)}
              disabled={generating}
            >
              <option value="sprite">Sprite (costume)</option>
              <option value="background">Background</option>
            </select>
          </label>
          <label className={moduleStyles.field}>
            <span>Style</span>
            <select
              value={style}
              onChange={e => setStyle(e.target.value as SpriteLab2ItemStyle)}
              disabled={generating}
            >
              <option value="smooth">Smooth</option>
              <option value="pixel">Pixel art</option>
            </select>
          </label>
        </div>
        <div className={moduleStyles.fieldRow}>
          <label
            className={classNames(moduleStyles.field, moduleStyles.fieldGrow)}
          >
            <span>Description</span>
            <input
              type="text"
              value={prompt}
              placeholder="e.g. a friendly green dragon"
              onChange={e => setPrompt(e.target.value)}
              disabled={generating}
            />
          </label>
          <MuiButton
            type="button"
            variant="contained"
            color="secondary"
            size="small"
            className={moduleStyles.generateButton}
            onClick={handleGenerate}
            loading={generating}
            disabled={generating}
          >
            {generating ? 'Generating…' : 'Generate'}
          </MuiButton>
        </div>
        {error && <div className={moduleStyles.generateError}>{error}</div>}
      </div>

      <div className={moduleStyles.imageGallery}>
        {images.length === 0 && (
          <div className={moduleStyles.galleryEmpty}>
            No images yet. Generate one above to use it in your code.
          </div>
        )}
        {images.map(({key, props}) => (
          <div key={key} className={moduleStyles.imageCard}>
            <button
              type="button"
              className={moduleStyles.imageThumb}
              title={`Edit ${props?.name || 'image'}`}
              onClick={() => setEditingKey(key)}
            >
              {(props?.dataURI || props?.sourceUrl) && (
                <img
                  src={
                    getTrimmedThumbnail(props?.name) ||
                    props.dataURI ||
                    props.sourceUrl
                  }
                  alt={props?.name || 'image'}
                />
              )}
            </button>
            <div className={moduleStyles.imageName} title={props?.name}>
              {props?.name}
            </div>
            <button type="button" onClick={() => handleDelete(key)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {editingProps && (
        <PixelEditorModal
          title={`Edit ${editingProps.name}`}
          // Edit the ORIGINAL image (untrimmed): trims are a display-time
          // optimization; the animation's pixels are the source of truth.
          imageUrl={editingProps.dataURI || editingProps.sourceUrl || ''}
          onSave={handleEditorSave}
          onCancel={() => setEditingKey(null)}
        />
      )}
    </div>
  );
};

export default GenerateImagePane;
