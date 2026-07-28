import React, {useCallback, useState} from 'react';
import {AnyAction} from 'redux';

import {
  addAnimation,
  isNameUnique,
  setAnimationName,
} from '@cdo/apps/p5lab/redux/animationList';
import {getStore} from '@cdo/apps/redux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import {
  generateImage,
  SpriteLab2ItemStyle,
  SpriteLab2ItemType,
  UploadImageFunction,
} from '../ai/items/itemGeneration';
import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

// Sanitize names as typed (drop double quotes, collapse whitespace) so they
// stay reliable references in AI-generated code, which matches names as tokens.
const NAME_MAX_LENGTH = 40;
const sanitizeName = (raw: string) =>
  raw
    .replace(/"/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, NAME_MAX_LENGTH);

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
 * The image-generation form, hosted in the Guide (see GenerateSpriteLab).
 * Generates a sprite or background from a text prompt, uploads it via
 * uploadImage, and bridges it into the animation list so it becomes an
 * ordinary costume/background.
 */
const GenerateImageForm: React.FunctionComponent<{
  uploadImage?: UploadImageFunction;
}> = ({uploadImage}) => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [itemType, setItemType] = useState<SpriteLab2ItemType>('sprite');
  const [style, setStyle] = useState<SpriteLab2ItemStyle>('smooth');
  const [status, setStatus] = useState<'idle' | 'generating'>('idle');
  const [error, setError] = useState<string | null>(null);

  const generating = status === 'generating';
  const trimmedName = name.trim();
  const trimmedPrompt = prompt.trim();
  // Names must be unique — the runtime and block dropdowns identify a costume by name.
  const existingNames = useAppSelector(state =>
    Object.values(state.animationList.propsByKey).map(p => p.name)
  );
  const nameTaken = !!trimmedName && existingNames.includes(trimmedName);
  // Both fields are required, and the name must be free.
  const canGenerate =
    !generating && !!trimmedName && !!trimmedPrompt && !nameTaken;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      return;
    }
    // Don't generate if we can't upload.
    if (!uploadImage) {
      setError("Images can't be saved right now.");
      return;
    }
    setStatus('generating');
    setError(null);
    try {
      const {filename, uint8Array, mediaType, pixelGridSize} =
        await generateImage(trimmedPrompt, itemType, style);
      const url = await uploadImage(filename, uint8Array, mediaType);
      const frameSize = await getImageSize(uint8Array, mediaType);
      const key = createUuid();
      // Bridge into the animation list: addAnimation fetches sourceUrl, builds
      // the dataURI, and (for Sprite Lab) inserts at the top of the list.
      dispatch(
        // addAnimation is an untyped JS thunk (inferred as Function); cast so
        // the dispatch overloads accept it. redux-thunk runs the function.
        addAnimation(key, {
          name: trimmedName,
          sourceUrl: url,
          frameSize,
          frameCount: 1,
          frameDelay: 2,
          looping: true,
          categories:
            itemType === 'background'
              ? [BACKGROUNDS_CATEGORY]
              : itemType === 'block'
              ? [BLOCKS_CATEGORY]
              : [],
          // Recorded once here; the pixel editor trusts this instead of
          // re-detecting the grid on every open.
          pixelGridSize,
        }) as unknown as AnyAction
      );
      // The classic thunk unconditionally renames to name_N; take the plain
      // name back (we required it free above, so it's still available).
      if (
        isNameUnique(
          trimmedName,
          getStore().getState().animationList.propsByKey
        )
      ) {
        dispatch(setAnimationName(key, trimmedName) as unknown as AnyAction);
      }
      // Clear both fields so a stale description can't pair with a new name.
      setName('');
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStatus('idle');
    }
  }, [
    canGenerate,
    trimmedName,
    trimmedPrompt,
    itemType,
    style,
    uploadImage,
    dispatch,
  ]);

  return (
    <div className={moduleStyles.guideForm}>
      <strong>Generate an image with AI</strong>
      <div className={moduleStyles.guideFields}>
        <label className={moduleStyles.guideFieldGrow}>
          <span>Name</span>
          <input
            type="text"
            value={name}
            placeholder="e.g. hero"
            maxLength={NAME_MAX_LENGTH}
            onChange={e => setName(sanitizeName(e.target.value))}
            disabled={generating}
          />
        </label>
        <label>
          <span>Type</span>
          <select
            value={itemType}
            onChange={e => setItemType(e.target.value as SpriteLab2ItemType)}
            disabled={generating}
          >
            <option value="sprite">Sprite (costume)</option>
            <option value="background">Background</option>
            <option value="block">Block (platform tile)</option>
          </select>
        </label>
        <label>
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
      <div className={moduleStyles.guideRow}>
        <input
          type="text"
          value={prompt}
          placeholder="Describe it, e.g. a friendly green dragon"
          onChange={e => setPrompt(e.target.value)}
          disabled={generating}
        />
        <button type="button" onClick={handleGenerate} disabled={!canGenerate}>
          {generating ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {nameTaken && (
        <div className={moduleStyles.generateError}>
          That name is already used. Choose a new name.
        </div>
      )}
      {error && <div className={moduleStyles.generateError}>{error}</div>}
    </div>
  );
};

export default GenerateImageForm;
