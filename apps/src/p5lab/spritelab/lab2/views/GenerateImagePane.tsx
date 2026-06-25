import React, {useCallback, useState} from 'react';
import {AnyAction} from 'redux';

import {
  addAnimation,
  deleteAnimation,
} from '@cdo/apps/p5lab/redux/animationList';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import {
  generateImage,
  SpriteLab2ItemType,
  uploadAssetToProject,
} from '../ai/items/itemGeneration';

import moduleStyles from './sprite-lab2-view.module.scss';

const BACKGROUNDS_CATEGORY = 'backgrounds';

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
        channelId,
        itemType
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
  }, [prompt, name, itemType, channelId, dispatch]);

  // The project's images live in the animation list (AI-generated images are
  // bridged in there); this view is also how you manage them.
  const images = useAppSelector(state =>
    state.animationList.orderedKeys.map(key => ({
      key,
      props: state.animationList.propsByKey[key],
    }))
  );

  const handleDelete = useCallback(
    (key: string) => {
      dispatch(
        // deleteAnimation is an untyped JS thunk; cast for dispatch.
        deleteAnimation(key, true /* isSpriteLab */) as unknown as AnyAction
      );
    },
    [dispatch]
  );

  const generating = status === 'generating';

  return (
    <div className={moduleStyles.imagesManager}>
      <div className={moduleStyles.generatePane}>
        <strong>Generate an image with AI</strong>
        <label>
          Name
          <input
            type="text"
            value={name}
            placeholder="e.g. hero"
            onChange={e => setName(e.target.value)}
            disabled={generating}
          />
        </label>
        <label>
          Description
          <input
            type="text"
            value={prompt}
            placeholder="e.g. a friendly green dragon"
            onChange={e => setPrompt(e.target.value)}
            disabled={generating}
          />
        </label>
        <label>
          Type
          <select
            value={itemType}
            onChange={e => setItemType(e.target.value as SpriteLab2ItemType)}
            disabled={generating}
          >
            <option value="sprite">Sprite (costume)</option>
            <option value="background">Background</option>
          </select>
        </label>
        <button type="button" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating…' : 'Generate'}
        </button>
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
            <div className={moduleStyles.imageThumb}>
              {(props?.dataURI || props?.sourceUrl) && (
                <img
                  src={props.dataURI || props.sourceUrl}
                  alt={props?.name || 'image'}
                />
              )}
            </div>
            <div className={moduleStyles.imageName} title={props?.name}>
              {props?.name}
            </div>
            <button type="button" onClick={() => handleDelete(key)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerateImagePane;
