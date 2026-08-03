import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import Slider from '@code-dot-org/component-library/slider';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
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

// The temperature slider runs 0..10 for friendly whole numbers; the
// service's scale is 0..2 with 1.0 the default.
const TEMPERATURE_LEVEL_MAX = 10;
const TEMPERATURE_LEVEL_DEFAULT = 5;
const levelToTemperature = (level: number) =>
  (level / TEMPERATURE_LEVEL_MAX) * 2;

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
  /** The image's current pixels, held on the left until a result lands. */
  thumb?: string;
  /** Set when creating a brand-new image. */
  create?: {
    /** Whether another image already uses this name. */
    isNameTaken: (name: string) => boolean;
    /** Paint from a blank canvas instead of generating; error or null. */
    onPaintInstead: (name: string) => string | null;
    // Handing off to the paint editor unmounts this view; if that paint is
    // cancelled, the name typed before the handoff comes back through here.
    initialName?: string;
  };
  /** Persist an accepted result (name set when creating). */
  onAccept: (
    result: GeneratedImageResult,
    name?: string
  ) => Promise<void> | void;
}

/**
 * The image dialog's Generate view: the current image (or a blank area) on
 * the left where the result will land; on the right the prompt, style, a
 * choice of where the randomness comes from, and a temperature slider with
 * a bot whose expression follows it. Renders the dialog body and the footer
 * button row.
 */
const GenerateImageView: React.FunctionComponent<GenerateImageViewProps> = ({
  existing,
  thumb,
  create,
  onAccept,
}) => {
  const [mode, setMode] = useState<GenerateMode>('prompt');
  const [prompt, setPrompt] = useState(existing?.generation?.prompt || '');
  const [name, setName] = useState(create?.initialName || '');
  const [paintError, setPaintError] = useState<string | null>(null);
  const [itemType, setItemType] = useState<SpriteLab2ItemType>(
    existing?.itemType || 'sprite'
  );
  const [style, setStyle] = useState<SpriteLab2ItemStyle>(
    existing?.generation?.style || 'smooth'
  );
  const [temperatureLevel, setTemperatureLevel] = useState(
    TEMPERATURE_LEVEL_DEFAULT
  );
  const [source, setSource] = useState<RandomnessSource>('new');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Flag a duplicate as it's typed and hold the buttons until it's unique.
  const trimmedName = name.trim();
  const duplicateName =
    !!create && !!trimmedName && create.isNameTaken(trimmedName);
  const nameUsable = !create || (!!trimmedName && !duplicateName);
  const nameError = duplicateName ? 'That name is already used.' : paintError;

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
          temperature: levelToTemperature(temperatureLevel),
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
      temperatureLevel,
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
      await onAccept(result, create ? trimmedName : undefined);
    } finally {
      setAccepting(false);
    }
  }, [result, onAccept, create, trimmedName]);

  const botImage =
    mode === 'generating'
      ? BOT_GENERATING_IMAGES[generatingTick % BOT_GENERATING_IMAGES.length]
      : BOT_IMAGES[
          Math.min(
            BOT_IMAGES.length - 1,
            Math.floor(
              (temperatureLevel / TEMPERATURE_LEVEL_MAX) * BOT_IMAGES.length
            )
          )
        ];

  const generating = mode === 'generating';
  const reviewing = mode === 'reviewing' && !!result;
  // The current image holds the left pane until the result replaces it.
  const displayUrl = resultUrl || thumb;

  return (
    <>
      <div className={moduleStyles.body}>
        <div
          className={classNames(
            moduleStyles.imagePane,
            displayUrl && moduleStyles.imagePaneChecker
          )}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={resultUrl ? 'Generated result' : 'Current image'}
            />
          ) : (
            <div className={moduleStyles.imagePlaceholder} aria-hidden />
          )}
        </div>
        <div className={moduleStyles.detailsPane}>
          {reviewing ? (
            <p className={moduleStyles.reviewHint}>
              Keep it, try again with the same settings, or go back and change
              the prompt.
            </p>
          ) : (
            <>
              {create && (
                <div className={moduleStyles.formRow}>
                  <div>
                    <TextField
                      name="newImageName"
                      label="Name"
                      value={name}
                      errorMessage={nameError || undefined}
                      disabled={generating}
                      onChange={e => {
                        setName(e.target.value);
                        setPaintError(null);
                      }}
                    />
                  </div>
                  <fieldset
                    className={moduleStyles.radioGroup}
                    disabled={generating}
                  >
                    <legend>Type</legend>
                    <RadioButton
                      name="generation-type"
                      value="sprite"
                      label="Sprite (costume)"
                      checked={itemType === 'sprite'}
                      onChange={() => setItemType('sprite')}
                    />
                    <RadioButton
                      name="generation-type"
                      value="background"
                      label="Background"
                      checked={itemType === 'background'}
                      onChange={() => setItemType('background')}
                    />
                    <RadioButton
                      name="generation-type"
                      value="block"
                      label="Block (platform tile)"
                      checked={itemType === 'block'}
                      onChange={() => setItemType('block')}
                    />
                  </fieldset>
                </div>
              )}

              <div className={moduleStyles.formRow}>
                <label
                  className={classNames(
                    moduleStyles.promptLabel,
                    moduleStyles.wide
                  )}
                >
                  <span>Describe it</span>
                  <textarea
                    className={moduleStyles.promptInput}
                    value={prompt}
                    rows={5}
                    placeholder="e.g. a friendly green dragon"
                    disabled={generating}
                    onChange={e => setPrompt(e.target.value)}
                  />
                </label>
                <fieldset
                  className={moduleStyles.radioGroup}
                  disabled={generating}
                >
                  <legend>Style</legend>
                  <RadioButton
                    name="generation-style"
                    value="smooth"
                    label="Smooth"
                    checked={style === 'smooth'}
                    onChange={() => setStyle('smooth')}
                  />
                  <RadioButton
                    name="generation-style"
                    value="pixel"
                    label="Pixel art"
                    checked={style === 'pixel'}
                    onChange={() => setStyle('pixel')}
                  />
                </fieldset>
              </div>

              <div className={moduleStyles.formRow}>
                <fieldset
                  className={classNames(
                    moduleStyles.radioGroup,
                    moduleStyles.wide
                  )}
                  disabled={generating}
                >
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
                <div className={moduleStyles.temperatureGroup}>
                  <span id="temperature-label">Temperature</span>
                  <img
                    src={botImage}
                    className={moduleStyles.bot}
                    alt=""
                    draggable={false}
                  />
                  <Slider
                    name="temperature-slider"
                    aria-labelledby="temperature-label"
                    minValue={0}
                    maxValue={TEMPERATURE_LEVEL_MAX}
                    step={1}
                    value={temperatureLevel}
                    onChange={e => setTemperatureLevel(+e.target.value)}
                    hideValue={true}
                    color="aqua"
                    leftButtonProps={{
                      children: (
                        <FontAwesomeV6Icon
                          iconName="minus"
                          title="Lower temperature"
                        />
                      ),
                      ['aria-label']: 'Lower temperature',
                    }}
                    rightButtonProps={{
                      children: (
                        <FontAwesomeV6Icon
                          iconName="plus"
                          title="Raise temperature"
                        />
                      ),
                      ['aria-label']: 'Raise temperature',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div aria-live="polite" className={moduleStyles.generateError}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div className={moduleStyles.footer}>
        {reviewing ? (
          <>
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
            <button
              type="button"
              className={moduleStyles.button}
              disabled={accepting}
              onClick={() => generate(true)}
            >
              <FontAwesomeV6Icon iconName="arrows-rotate" />
              Regenerate
            </button>
            <button
              type="button"
              className={moduleStyles.primaryButton}
              disabled={accepting}
              onClick={handleContinue}
            >
              {accepting ? 'Saving…' : 'Continue'}
              <FontAwesomeV6Icon iconName="arrow-right" />
            </button>
          </>
        ) : (
          <>
            {create && (
              <div className={moduleStyles.footerLeft}>
                <button
                  type="button"
                  className={moduleStyles.button}
                  disabled={generating || !nameUsable}
                  onClick={() =>
                    setPaintError(create.onPaintInstead(trimmedName))
                  }
                >
                  Paint it instead
                </button>
              </div>
            )}
            <button
              type="button"
              className={moduleStyles.primaryButton}
              disabled={generating || !prompt.trim() || !nameUsable}
              onClick={() => generate(false)}
            >
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default GenerateImageView;
