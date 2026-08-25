import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import Slider from '@code-dot-org/component-library/slider';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';

import aiBot0 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-0.png';
import aiBot1 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-1.png';
import aiBot2 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-2.png';
import aiBot3 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-3.png';
import aiBotGenerating0 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-0.png';
import aiBotGenerating1 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-1.png';
import aiBotGenerating2 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-2.png';

import {
  CHARACTER_SET_FRAME_COUNT,
  CharacterSetProgress,
  generateCharacterSet,
} from '../ai/images/characterSet';
import {
  GeneratedImageResult,
  generateImage,
  GenerateImageOptions,
} from '../ai/images/imageGeneration';
import {
  IMAGE_STYLE_LABELS,
  IMAGE_TYPE_LABELS,
  ImageGenerationMetadata,
  ImageStyle,
  ImageType,
} from '../ai/images/types';
import {CHARACTER_BASE_NAME_MAX_LENGTH} from '../characterAnimations';
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
  };
  /** Level-imposed type for new images; the Type choice is locked to it. */
  lockedImageType?: ImageType;
  /** Persist a finished result (name set when creating). */
  onAccept: (
    result: GeneratedImageResult,
    name?: string
  ) => Promise<void> | void;
  /**
   * Persist an accepted character set (creating only): the base member
   * first, then the rest.
   */
  onAcceptSet?: (
    results: GeneratedImageResult[],
    newName: string
  ) => Promise<void>;
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
  onAccept,
  onAcceptSet,
  onCancel,
  onDelete,
}) => {
  const [mode, setMode] = useState<GenerateMode>('prompt');
  const [prompt, setPrompt] = useState(existing?.generation?.prompt || '');
  const [name, setName] = useState('');
  const [imageType, setImageType] = useState<ImageType>(
    existing?.imageType || lockedImageType || 'sprite'
  );
  const [style, setStyle] = useState<ImageStyle>(
    existing?.generation?.style || 'smooth'
  );
  const [temperatureLevel, setTemperatureLevel] = useState(
    TEMPERATURE_LEVEL_DEFAULT
  );
  const [source, setSource] = useState<RandomnessSource>('new');
  const [error, setError] = useState<string | null>(null);
  // A whole character — standing, walking, jumping, both ways — instead of
  // one picture. New sprites only: a set is drawn from a fresh base.
  const [characterSet, setCharacterSet] = useState(false);
  const [progress, setProgress] = useState<CharacterSetProgress | null>(null);
  const canMakeSet =
    !!create && !!onAcceptSet && imageType === 'sprite' && source === 'new';
  const makingSet = canMakeSet && characterSet;

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
        imageType,
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
      if (makingSet && onAcceptSet) {
        const results = await generateCharacterSet(
          prompt.trim(),
          {style, temperature: options.temperature},
          setProgress
        );
        await onAcceptSet(results, trimmedName);
        return;
      }
      const result = await generateImage(prompt.trim(), options);
      // Apply immediately; the caller flips back to the summary view.
      await onAccept(result, create ? trimmedName : undefined);
    } catch {
      setError(
        makingSet
          ? "Couldn't finish the character. Try again."
          : "Couldn't generate the image. Try again."
      );
      setMode('prompt');
      setProgress(null);
    }
  }, [
    prompt,
    imageType,
    style,
    temperatureLevel,
    source,
    existing,
    canUseSeed,
    create,
    trimmedName,
    onAccept,
    onAcceptSet,
    makingSet,
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
                maxLength={
                  makingSet
                    ? CHARACTER_BASE_NAME_MAX_LENGTH
                    : IMAGE_NAME_MAX_LENGTH
                }
                onChange={e => setName(sanitizeImageName(e.target.value))}
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
                {(['sprite', 'background', 'block'] as const).map(type => (
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
            </div>
          </div>

          {canMakeSet && (
            <div className={moduleStyles.formRow}>
              <Checkbox
                name="character-set"
                label={`Make a character set: standing, walking and jumping, facing right and left (${CHARACTER_SET_FRAME_COUNT} pictures; takes a few minutes)`}
                size="s"
                checked={characterSet}
                disabled={generating}
                onChange={e => {
                  setCharacterSet(e.target.checked);
                  // The member names add a suffix; keep the whole set in
                  // the name limit.
                  if (e.target.checked) {
                    setName(n => n.slice(0, CHARACTER_BASE_NAME_MAX_LENGTH));
                  }
                }}
              />
            </div>
          )}

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
          {generating && progress && (
            <div aria-live="polite" className={moduleStyles.generateProgress}>
              {progress.done < progress.total
                ? `Drawing ${progress.done + 1} of ${progress.total}: ${
                    progress.label
                  }…`
                : 'Putting the frames together…'}
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
