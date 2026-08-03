import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import Slider from '@code-dot-org/component-library/slider';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {generateImage, GenerateImageOptions} from '../ai/items/itemGeneration';
import {
  ImageGenerationMetadata,
  SpriteLab2ItemStyle,
  SpriteLab2ItemType,
} from '../types';

import moduleStyles from './image-details-dialog.module.scss';

// Our own copies (not Music Lab's) — these may not live long.
const BOT_IMAGES = [
  require('@cdo/static/spritelab_lab2/ai-bot/ai-bot-0.png'),
  require('@cdo/static/spritelab_lab2/ai-bot/ai-bot-1.png'),
  require('@cdo/static/spritelab_lab2/ai-bot/ai-bot-2.png'),
  require('@cdo/static/spritelab_lab2/ai-bot/ai-bot-3.png'),
];
const BOT_GENERATING_IMAGES = [
  require('@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-0.png'),
  require('@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-1.png'),
  require('@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-2.png'),
];

// The wildness slider runs 0..10 for friendly whole numbers; the service's
// scale is 0..2 with 1.0 the default.
const WILDNESS_MAX = 10;
const WILDNESS_DEFAULT = 5;
const wildnessToTemperature = (wildness: number) =>
  (wildness / WILDNESS_MAX) * 2;

export interface GeneratedImageResult {
  filename: string;
  uint8Array: Uint8Array;
  mediaType: string;
  pixelGridSize?: number;
  generation: ImageGenerationMetadata;
}

type GenerateMode = 'prompt' | 'generating' | 'reviewing';
type RandomnessSource = 'new' | 'seed' | 'previous';

interface GenerateImageViewProps {
  /** Set for an existing image; absent when generating a brand-new one. */
  existing?: {
    generation?: ImageGenerationMetadata;
    // Locked: regenerating can't change what kind of image this is.
    itemType: SpriteLab2ItemType;
    /** Current pixels, for "use previous image". */
    getDataURI: () => Promise<string | null>;
  };
  onAccept: (result: GeneratedImageResult) => Promise<void> | void;
  onBack: () => void;
}

/**
 * The image dialog's Generate view: prompt, type/style, a wildness slider
 * with a bot whose expression follows it, and a choice of where the
 * randomness comes from — a fresh roll, the image's saved seed, or the
 * image itself as a starting point.
 */
const GenerateImageView: React.FunctionComponent<GenerateImageViewProps> = ({
  existing,
  onAccept,
  onBack,
}) => {
  const [mode, setMode] = useState<GenerateMode>('prompt');
  const [prompt, setPrompt] = useState(existing?.generation?.prompt || '');
  const [itemType, setItemType] = useState<SpriteLab2ItemType>(
    existing?.itemType || 'sprite'
  );
  const [style, setStyle] = useState<SpriteLab2ItemStyle>(
    existing?.generation?.style || 'smooth'
  );
  const [wildness, setWildness] = useState(WILDNESS_DEFAULT);
  const [source, setSource] = useState<RandomnessSource>('new');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Cycle the bot's generating frames while a request is out.
  const [generatingTick, setGeneratingTick] = useState(0);
  useEffect(() => {
    if (mode !== 'generating') {
      return;
    }
    const timer = setInterval(() => setGeneratingTick(t => t + 1), 350);
    return () => clearInterval(timer);
  }, [mode]);

  const setPreview = useCallback((next: GeneratedImageResult | null) => {
    setResult(next);
    setResultUrl(prev => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      if (!next) {
        return null;
      }
      const buffer = new Uint8Array(next.uint8Array).buffer as ArrayBuffer;
      return URL.createObjectURL(new Blob([buffer], {type: next.mediaType}));
    });
  }, []);
  const setPreviewRef = useRef(setPreview);
  setPreviewRef.current = setPreview;
  useEffect(() => () => setPreviewRef.current(null), []);

  const canUseSeed = existing?.generation?.seed !== undefined;
  const canUsePrevious = !!existing;

  const generate = useCallback(
    async (rerollSeed: boolean) => {
      setMode('generating');
      setError(null);
      try {
        const options: GenerateImageOptions = {
          itemType,
          style,
          temperature: wildnessToTemperature(wildness),
        };
        // Regenerate always re-rolls, even in same-seed mode: replaying the
        // seed would hand back a near-copy of what was just declined.
        if (source === 'seed' && canUseSeed && !rerollSeed) {
          options.seed = existing?.generation?.seed;
        }
        if (source === 'previous' && existing) {
          const dataURI = await existing.getDataURI();
          if (!dataURI) {
            throw new Error("Couldn't read the current image.");
          }
          options.inputImageDataURI = dataURI;
        }
        setPreview(await generateImage(prompt.trim(), options));
        setMode('reviewing');
      } catch {
        setError("Couldn't generate the image. Try again.");
        setMode('prompt');
      }
    },
    [
      prompt,
      itemType,
      style,
      wildness,
      source,
      existing,
      canUseSeed,
      setPreview,
    ]
  );

  const handleContinue = useCallback(async () => {
    if (!result) {
      return;
    }
    setAccepting(true);
    try {
      await onAccept(result);
    } finally {
      setAccepting(false);
    }
  }, [result, onAccept]);

  const botImage =
    mode === 'generating'
      ? BOT_GENERATING_IMAGES[generatingTick % BOT_GENERATING_IMAGES.length]
      : BOT_IMAGES[
          Math.min(
            BOT_IMAGES.length - 1,
            Math.floor((wildness / WILDNESS_MAX) * BOT_IMAGES.length)
          )
        ];

  if (mode === 'reviewing' && result) {
    return (
      <div className={moduleStyles.body}>
        <div className={moduleStyles.imagePane}>
          {resultUrl && <img src={resultUrl} alt="Generated result" />}
        </div>
        <div className={moduleStyles.detailsPane}>
          <p className={moduleStyles.reviewHint}>
            Keep it, try again with the same settings, or go back and change the
            prompt.
          </p>
          <div className={moduleStyles.actions}>
            <button
              type="button"
              className={moduleStyles.primaryButton}
              disabled={accepting}
              onClick={handleContinue}
            >
              {accepting ? 'Saving…' : 'Continue'}
            </button>
            <button
              type="button"
              className={moduleStyles.button}
              disabled={accepting}
              onClick={() => generate(true)}
            >
              Regenerate
            </button>
            <button
              type="button"
              className={moduleStyles.button}
              disabled={accepting}
              onClick={() => {
                setPreview(null);
                setMode('prompt');
              }}
            >
              Back to prompt
            </button>
          </div>
        </div>
      </div>
    );
  }

  const generating = mode === 'generating';
  return (
    <div className={moduleStyles.generateView}>
      <label className={moduleStyles.promptLabel}>
        <span>Describe it</span>
        <textarea
          className={moduleStyles.promptInput}
          value={prompt}
          rows={3}
          placeholder="e.g. a friendly green dragon"
          disabled={generating}
          onChange={e => setPrompt(e.target.value)}
        />
      </label>

      <div className={moduleStyles.fieldRow}>
        {!existing && (
          <label>
            <span>Type</span>
            <select
              value={itemType}
              disabled={generating}
              onChange={e => setItemType(e.target.value as SpriteLab2ItemType)}
            >
              <option value="sprite">Sprite (costume)</option>
              <option value="background">Background</option>
              <option value="block">Block (platform tile)</option>
            </select>
          </label>
        )}
        <label>
          <span>Style</span>
          <select
            value={style}
            disabled={generating}
            onChange={e => setStyle(e.target.value as SpriteLab2ItemStyle)}
          >
            <option value="smooth">Smooth</option>
            <option value="pixel">Pixel art</option>
          </select>
        </label>
      </div>

      <fieldset className={moduleStyles.sourceGroup} disabled={generating}>
        <legend>Start from</legend>
        <RadioButton
          name="generation-source"
          value="new"
          label="Create new image"
          checked={source === 'new'}
          onChange={() => setSource('new')}
        />
        <RadioButton
          name="generation-source"
          value="seed"
          label="Use same seed (small prompt changes keep the picture similar)"
          checked={source === 'seed'}
          disabled={!canUseSeed}
          onChange={() => setSource('seed')}
        />
        <RadioButton
          name="generation-source"
          value="previous"
          label="Use previous image (the prompt modifies it)"
          checked={source === 'previous'}
          disabled={!canUsePrevious}
          onChange={() => setSource('previous')}
        />
      </fieldset>

      <div className={moduleStyles.botRow}>
        <img
          src={botImage}
          className={moduleStyles.bot}
          alt=""
          draggable={false}
        />
        <div className={moduleStyles.wildness}>
          <span id="wildness-label">Wildness</span>
          <Slider
            name="wildness-slider"
            aria-labelledby="wildness-label"
            minValue={0}
            maxValue={WILDNESS_MAX}
            step={1}
            value={wildness}
            onChange={e => setWildness(+e.target.value)}
            hideValue={true}
            color="aqua"
            leftButtonProps={{
              children: <FontAwesomeV6Icon iconName="minus" title="Tamer" />,
              ['aria-label']: 'Tamer',
            }}
            rightButtonProps={{
              children: <FontAwesomeV6Icon iconName="plus" title="Wilder" />,
              ['aria-label']: 'Wilder',
            }}
          />
        </div>
      </div>

      {error && (
        <div aria-live="polite" className={moduleStyles.generateError}>
          {error}
        </div>
      )}

      <div className={moduleStyles.actions}>
        <button
          type="button"
          className={moduleStyles.primaryButton}
          disabled={generating || !prompt.trim()}
          onClick={() => generate(false)}
        >
          {generating ? 'Generating…' : 'Generate'}
        </button>
        <button
          type="button"
          className={moduleStyles.button}
          disabled={generating}
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default GenerateImageView;
