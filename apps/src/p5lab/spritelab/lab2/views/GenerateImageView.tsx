import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import Slider from '@code-dot-org/component-library/slider';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';

import {generateImage, GenerateImageOptions} from '../ai/items/itemGeneration';
import {
  ImageGenerationMetadata,
  ITEM_STYLE_LABELS,
  ITEM_TYPE_LABELS,
  SpriteLab2ItemStyle,
  SpriteLab2ItemType,
} from '../types';

import DeleteImageButton from './DeleteImageButton';

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

type GenerateMode = 'prompt' | 'generating';
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
  /** The image's current pixels, shown on the left while prompting. */
  thumb?: string;
  /** Set when creating a brand-new image. */
  create?: {
    /** Whether another image already uses this name. */
    isNameTaken: (name: string) => boolean;
  };
  /** Persist a finished result (name set when creating). */
  onAccept: (
    result: GeneratedImageResult,
    name?: string
  ) => Promise<void> | void;
  /** Leave without generating: back to the summary, or out of the dialog
      for a brand-new image. */
  onCancel: () => void;
  /** Delete this image (existing images). */
  onDelete?: () => void;
}

/**
 * The image dialog's Generate view: the current image (or a blank area) on
 * the left; on the right the prompt, style, a choice of where the
 * randomness comes from, and a temperature slider with a bot whose
 * expression follows it. A finished generation is applied immediately —
 * the caller returns to the summary showing the new image. Renders the
 * dialog body and the footer button row.
 */
const GenerateImageView: React.FunctionComponent<GenerateImageViewProps> = ({
  existing,
  thumb,
  create,
  onAccept,
  onCancel,
  onDelete,
}) => {
  const [mode, setMode] = useState<GenerateMode>('prompt');
  const [prompt, setPrompt] = useState(existing?.generation?.prompt || '');
  const [name, setName] = useState('');
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

  // Flag a duplicate as it's typed and hold the buttons until it's unique.
  const trimmedName = name.trim();
  const duplicateName =
    !!create && !!trimmedName && create.isNameTaken(trimmedName);
  const nameUsable = !create || (!!trimmedName && !duplicateName);
  const nameError = duplicateName ? 'That name is already used.' : null;

  // Cycle the bot's generating frames while a request is out.
  const [generatingTick, setGeneratingTick] = useState(0);
  useEffect(() => {
    if (mode !== 'generating') {
      return;
    }
    const timer = setInterval(() => setGeneratingTick(t => t + 1), 350);
    return () => clearInterval(timer);
  }, [mode]);

  const canUseSeed = existing?.generation?.seed !== undefined;
  const canUsePrevious = !!existing;

  const generate = useCallback(async () => {
    setMode('generating');
    setError(null);
    try {
      const options: GenerateImageOptions = {
        itemType,
        style,
        temperature: levelToTemperature(temperatureLevel),
      };
      if (source === 'seed' && canUseSeed) {
        options.seed = existing?.generation?.seed;
      }
      if (source === 'previous' && existing) {
        const dataURI = await existing.getDataURI();
        if (!dataURI) {
          throw new Error("Couldn't read the current image.");
        }
        options.inputImageDataURI = dataURI;
      }
      const result = await generateImage(prompt.trim(), options);
      // Apply immediately; the caller flips back to the summary view.
      await onAccept(result, create ? trimmedName : undefined);
    } catch {
      setError("Couldn't generate the image. Try again.");
      setMode('prompt');
    }
  }, [
    prompt,
    itemType,
    style,
    temperatureLevel,
    source,
    existing,
    canUseSeed,
    create,
    trimmedName,
    onAccept,
  ]);

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

  return (
    <>
      <div className={moduleStyles.body}>
        <div
          className={classNames(
            moduleStyles.imagePane,
            thumb && moduleStyles.imagePaneChecker
          )}
        >
          {thumb ? (
            <img src={thumb} alt="" />
          ) : (
            <div className={moduleStyles.imagePlaceholder} aria-hidden />
          )}
        </div>
        <div className={moduleStyles.detailsPane}>
          {create && (
            <div>
              <TextField
                name="newImageName"
                label="Name"
                value={name}
                errorMessage={nameError || undefined}
                disabled={generating}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className={moduleStyles.formRow}>
            <label
              className={classNames(
                moduleStyles.promptLabel,
                moduleStyles.wide
              )}
            >
              <span>Prompt</span>
              <textarea
                className={moduleStyles.promptInput}
                value={prompt}
                rows={5}
                placeholder="e.g. a friendly green dragon"
                disabled={generating}
                onChange={e => setPrompt(e.target.value)}
              />
            </label>
            <div className={moduleStyles.formStack}>
              {/* An existing image's type is locked: regenerating can't
                  change what kind of image it is. */}
              <fieldset
                className={moduleStyles.radioGroup}
                disabled={generating || !!existing}
              >
                <legend>Type</legend>
                {(['sprite', 'background', 'block'] as const).map(type => (
                  <RadioButton
                    key={type}
                    name="generation-type"
                    value={type}
                    label={ITEM_TYPE_LABELS[type]}
                    size="s"
                    checked={itemType === type}
                    onChange={() => setItemType(type)}
                  />
                ))}
              </fieldset>
              <fieldset
                className={moduleStyles.radioGroup}
                disabled={generating}
              >
                <legend>Style</legend>
                {(['smooth', 'pixel'] as const).map(s => (
                  <RadioButton
                    key={s}
                    name="generation-style"
                    value={s}
                    label={ITEM_STYLE_LABELS[s]}
                    size="s"
                    checked={style === s}
                    onChange={() => setStyle(s)}
                  />
                ))}
              </fieldset>
            </div>
          </div>

          <div className={moduleStyles.formRow}>
            <fieldset
              className={classNames(moduleStyles.radioGroup, moduleStyles.wide)}
              disabled={generating}
            >
              <legend>Start from</legend>
              <RadioButton
                name="generation-source"
                value="new"
                label="Create new image"
                size="s"
                checked={source === 'new'}
                onChange={() => setSource('new')}
              />
              <RadioButton
                name="generation-source"
                value="seed"
                label="Use same seed (small prompt changes keep the picture similar)"
                size="s"
                checked={source === 'seed'}
                disabled={!canUseSeed}
                onChange={() => setSource('seed')}
              />
              <RadioButton
                name="generation-source"
                value="previous"
                label="Use previous image (the prompt modifies it)"
                size="s"
                checked={source === 'previous'}
                disabled={!canUsePrevious}
                onChange={() => setSource('previous')}
              />
            </fieldset>
            <fieldset
              className={classNames(
                moduleStyles.radioGroup,
                moduleStyles.temperatureGroup
              )}
              disabled={generating}
            >
              <legend id="temperature-label">Temperature</legend>
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
            </fieldset>
          </div>

          {error && (
            <div aria-live="polite" className={moduleStyles.generateError}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div className={moduleStyles.footer}>
        {onDelete && (
          <div className={moduleStyles.footerLeft}>
            <DeleteImageButton onDelete={onDelete} />
          </div>
        )}
        <button
          type="button"
          className={moduleStyles.button}
          disabled={generating}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={moduleStyles.primaryButton}
          disabled={generating || !prompt.trim() || !nameUsable}
          onClick={generate}
        >
          <FontAwesomeV6Icon iconName="sparkles" />
          {generating ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </>
  );
};

export default GenerateImageView;
