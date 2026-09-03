import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import Slider from '@code-dot-org/component-library/slider';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';
import aiBot0 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-0.png';
import aiBot1 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-1.png';
import aiBot2 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-2.png';
import aiBot3 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-3.png';
import aiBotGenerating0 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-0.png';
import aiBotGenerating1 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-1.png';
import aiBotGenerating2 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-2.png';

import {
  GeneratedImageResult,
  generateImage,
  GenerateImageOptions,
} from '../ai/images/imageGeneration';
import {
  DEFAULT_IMAGE_MODEL_ID,
  getImageModelSpec,
  IMAGE_MODEL_IDS,
  IMAGE_MODEL_SPECS,
} from '../ai/images/modelHelpers';
import {
  IMAGE_STYLE_LABELS,
  IMAGE_TYPE_LABELS,
  IMAGE_TYPES,
  ImageGenerationMetadata,
  ImageStyle,
  ImageType,
} from '../ai/images/types';
import {IMAGE_NAME_MAX_LENGTH, sanitizeImageName} from '../imageReferences';

import DeleteImageButton from './DeleteImageButton';
import TemperatureBot from './TemperatureBot';

import moduleStyles from './image-details-dialog.module.scss';

// Our own copies (not Music Lab's) — these may not live long.
const BOT_IMAGES = [aiBot0, aiBot1, aiBot2, aiBot3];
const BOT_GENERATING_IMAGES = [
  aiBotGenerating0,
  aiBotGenerating1,
  aiBotGenerating2,
];

// The temperature slider runs 0..10 for friendly whole numbers; the
// service's scale is 0..2 with 1.0 the default.
const TEMPERATURE_LEVEL_MAX = 10;
const TEMPERATURE_LEVEL_DEFAULT = 5;
const levelToTemperature = (level: number) =>
  (level / TEMPERATURE_LEVEL_MAX) * 2;

// Prompt hints, one per type, so the example suits what is being made.
const PROMPT_PLACEHOLDERS: Record<ImageType, string> = {
  sprite: 'e.g. a friendly green dragon',
  background: 'e.g. a misty forest at sunrise',
  block: 'e.g. a mossy stone brick',
};

type GenerateMode = 'prompt' | 'generating';
type RandomnessSource = 'new' | 'seed' | 'previous';

/** What the new-image form has settled on, enough to start painting. */
export interface NewImageDraft {
  name: string;
  imageType: ImageType;
  style: ImageStyle;
}

interface GenerateImageViewProps {
  /** Set for an existing image; absent when generating a brand-new one. */
  existing?: {
    generation?: ImageGenerationMetadata;
    // Locked: regenerating can't change what kind of image this is.
    imageType: ImageType;
    /** Current pixels, for "use previous image". */
    getDataURI: () => Promise<string | null>;
  };
  /** The image's current pixels, shown on the left while prompting. */
  thumb?: string;
  /** Set when creating a brand-new image. */
  create?: {
    /** Whether another image already uses this name. */
    isNameTaken: (name: string) => boolean;
    /** Form values to reopen with (returning from a cancelled paint). */
    initial?: NewImageDraft;
  };
  /** Open the paint editor on a blank canvas instead of generating. */
  onPaintManually?: (draft: NewImageDraft) => void;
  /** Level-imposed type for new images; the Type choice is locked to it. */
  lockedImageType?: ImageType;
  /** A generation request is leaving; fires before the model call, so the
      caller can stamp what the eventual result belongs to. */
  onGenerateStart?: () => void;
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
  lockedImageType,
  onPaintManually,
  onGenerateStart,
  onAccept,
  onCancel,
  onDelete,
}) => {
  const [mode, setMode] = useState<GenerateMode>('prompt');
  const [prompt, setPrompt] = useState(existing?.generation?.prompt || '');
  const [name, setName] = useState(create?.initial?.name || '');
  const [imageType, setImageType] = useState<ImageType>(
    existing?.imageType ||
      lockedImageType ||
      create?.initial?.imageType ||
      'sprite'
  );
  const [style, setStyle] = useState<ImageStyle>(
    existing?.generation?.style || create?.initial?.style || 'smooth'
  );
  const [temperatureLevel, setTemperatureLevel] = useState(
    TEMPERATURE_LEVEL_DEFAULT
  );
  // Regenerating defaults to whatever drew the current image, so a "try it
  // again" doesn't quietly switch models on the user.
  const [modelId, setModelId] = useState<string>(
    existing?.generation?.model || DEFAULT_IMAGE_MODEL_ID
  );
  const [source, setSource] = useState<RandomnessSource>('new');
  const [error, setError] = useState<string | null>(null);

  // The choice is a playtest affordance, not a student-facing feature yet.
  // With the experiment off there is one model and no fieldset.
  const showModelChoice = useMemo(
    () =>
      experiments.isEnabledAllowingQueryString(
        experiments.SPRITELAB_IMAGE_MODEL
      ),
    []
  );
  const modelSpec = getImageModelSpec(modelId);

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

  // A recorded seed can only be replayed by a model that takes one, and the
  // recorded seed belongs to the model that rolled it.
  const canUseSeed =
    existing?.generation?.seed !== undefined &&
    modelSpec.supportsSeed &&
    (existing?.generation?.model || DEFAULT_IMAGE_MODEL_ID) === modelId;
  const canUsePrevious = !!existing && modelSpec.supportsEdit;

  // Switching models can invalidate the current choice; fall back rather
  // than leave a checked radio the request would ignore.
  useEffect(() => {
    if (
      (source === 'seed' && !canUseSeed) ||
      (source === 'previous' && !canUsePrevious)
    ) {
      setSource('new');
    }
  }, [source, canUseSeed, canUsePrevious]);

  const generate = useCallback(async () => {
    onGenerateStart?.();
    setMode('generating');
    setError(null);
    try {
      const options: GenerateImageOptions = {
        imageType,
        style,
        model: modelId,
        ...(modelSpec.supportsTemperature && {
          temperature: levelToTemperature(temperatureLevel),
        }),
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
    imageType,
    style,
    modelId,
    modelSpec,
    temperatureLevel,
    source,
    existing,
    canUseSeed,
    create,
    trimmedName,
    onGenerateStart,
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
            <div className={moduleStyles.nameRow}>
              <TextField
                name="newImageName"
                label="Name"
                className={moduleStyles.nameField}
                value={name}
                aria-invalid={!!nameError || undefined}
                aria-describedby={
                  nameError ? 'new-image-name-error' : undefined
                }
                disabled={generating}
                maxLength={IMAGE_NAME_MAX_LENGTH}
                onChange={e => setName(sanitizeImageName(e.target.value))}
              />
              {/* Beside the field, not below it, so showing the message
                  never changes the dialog's height. */}
              {nameError && (
                <span
                  id="new-image-name-error"
                  role="status"
                  className={moduleStyles.inlineFieldError}
                >
                  {nameError}
                </span>
              )}
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
                placeholder={PROMPT_PLACEHOLDERS[imageType]}
                disabled={generating}
                onChange={e => setPrompt(e.target.value)}
              />
            </label>
            <div className={moduleStyles.formStack}>
              {/* Regenerating can't change what kind of image this is, and a
                  level can lock the choice for new images too. */}
              <fieldset
                className={moduleStyles.radioGroup}
                disabled={generating || !!existing || !!lockedImageType}
              >
                <legend>Type</legend>
                {IMAGE_TYPES.map(type => (
                  <RadioButton
                    key={type}
                    name="generation-type"
                    value={type}
                    label={IMAGE_TYPE_LABELS[type]}
                    size="s"
                    checked={imageType === type}
                    onChange={() => setImageType(type)}
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
                    label={IMAGE_STYLE_LABELS[s]}
                    size="s"
                    checked={style === s}
                    onChange={() => setStyle(s)}
                  />
                ))}
              </fieldset>
              {showModelChoice && (
                <fieldset
                  className={moduleStyles.radioGroup}
                  disabled={generating}
                >
                  <legend>Model</legend>
                  {IMAGE_MODEL_IDS.map(id => (
                    <RadioButton
                      key={id}
                      name="generation-model"
                      value={id}
                      label={IMAGE_MODEL_SPECS[id].label}
                      size="s"
                      checked={modelId === id}
                      onChange={() => setModelId(id)}
                    />
                  ))}
                </fieldset>
              )}
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
                label={
                  modelSpec.supportsSeed
                    ? 'Use same seed (small prompt changes keep the picture similar)'
                    : `Use same seed (${modelSpec.label} does not support seeds)`
                }
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
              disabled={generating || !modelSpec.supportsTemperature}
            >
              <legend id="temperature-label">
                {modelSpec.supportsTemperature
                  ? 'Temperature'
                  : `Temperature (not used by ${modelSpec.label})`}
              </legend>
              {/* A wink: choosing pixel-art style pixelates the bot too. */}
              <TemperatureBot src={botImage} pixelated={style === 'pixel'} />

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
        {create && onPaintManually && (
          <div className={moduleStyles.footerLeft}>
            <button
              type="button"
              className={moduleStyles.button}
              disabled={generating || !nameUsable}
              onClick={() =>
                onPaintManually({name: trimmedName, imageType, style})
              }
            >
              <FontAwesomeV6Icon iconName="paintbrush" />
              Paint manually
            </button>
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
