// Making a picture from a sentence of word chips: the words, the model's
// run, the picture it made, and the rating. A host lays the parts out.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Toggle from '@code-dot-org/component-library/toggle';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {generateCharacterSet} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {bytesToDataURI} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {
  CachedImage,
  findCachedImage,
  sentencePath,
  ImageSource,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  GeneratedImageResult,
  generateImage,
  GenerateImageOptions,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {ImageSafetyError} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageSafety';
import {defaultPixelGrid} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {
  ImageStyle,
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {
  CHARACTER_STRIP_FRAME_COUNT,
  stripCellOrigin,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

import AnimatedSheetPreview from '../AnimatedSheetPreview';
import BehindTheScenes from '../images/teaching/BehindTheScenes';
import {pickTip} from '../images/teaching/generationTips';
import StripFrame from '../StripFrame';

import {PixelReveal, SparkleBurst} from './PixelReveal';
import SentenceReadOnly from './SentenceReadOnly';
import {
  Choices,
  chosenBodyPlan,
  isComplete,
  promptText,
  restoreChoices,
  SavedChoices,
  sentenceFor,
  sentenceWordIds,
} from './sentences';
import {playSound} from './sentenceSounds';
import {SentPrompts, sentPromptsFor} from './sentPrompts';
import {Verdict} from './verdict';
import {WordLayout} from './wordLayout';
import {useWordMenus} from './WordMenus';

import styles from './sentence-scene.module.scss';

// Every picture is pixel art.
const STYLE: ImageStyle = 'pixel';
// The service's middle temperature.
const TEMPERATURE = 1;
// The making shows at least this long on a cached level, where a picture
// can land in well under a second.
const MIN_CACHED_GENERATING_MS = 5000;

export type Mode = 'edit' | 'generating' | 'result';

interface GeneratedPicture {
  /** The result's filename, unique per generation. */
  id: string;
  result: GeneratedImageResult;
  dataURI: string;
  /** The prompt the student built. */
  prompt: string;
  /** The words as the model got them, for "Behind the scenes". */
  sent: SentPrompts;
  /** Served from the cache rather than drawn by the model. */
  cached: boolean;
}

/** Settings from the Advanced popover: a typed prompt that replaces the
    chosen words, a coarser pixel grid, and the current picture as the
    model's input image. */
export interface AdvancedOptions {
  /** When set, the typed text is sent instead of the chosen words, and the
      result is always a single still picture, never a character set. */
  prompt?: string;
  /** Divides the kind's default pixel grid: 1 is the default. */
  pixelScale?: number;
  /** The current picture's pixels, which the prompt then modifies. */
  startFrom?: () => Promise<string | null>;
}

/** What a host lays out. The nodes are ready to place; the callbacks and
    flags let a host draw its own buttons. */
export interface SentenceSceneParts {
  mode: Mode;
  busy: boolean;
  /** Every word the sentence needs is chosen, or a prompt is typed. */
  complete: boolean;
  panelRef: React.RefObject<HTMLElement>;
  /** The frame's contents: the generated picture, the spinner while
      generating, or null before the first generation. */
  frame: React.ReactNode;
  /** A made picture is showing in the frame. */
  frameFilled: boolean;
  /** A reviewer's mark over a picture served from the tree, while the tree
      is filled in; comes out before ship. */
  cachedTag: React.ReactNode;
  /** The Behind the scenes button, once there is a picture. */
  behindTheScenes: React.ReactNode;
  /** The screen reader's status line. */
  status: React.ReactNode;
  /** The sentence line: its word chips, or the sentence read back while
      busy. */
  sentence: React.ReactNode;
  /** The words to choose from; the picture made from them stays in the
      frame until the next generation. */
  wordChooser: React.ReactNode;
  /** The Animated checkbox, for a character. */
  animatedChoice: React.ReactNode;
  error: React.ReactNode;
  /** A tip about how image-making AI works, shown while generating; a new
      one per generation, always different from the previous one. */
  tip: string | null;
  /** The rating: offered while a fresh picture (or, when the level rates
      every one, any picture) is in the frame. */
  rating: {
    offered: boolean;
    /** The level checks for a rating: the host offers no way to dismiss. */
    required: boolean;
    verdict: Verdict | null;
    judge: (verdict: Verdict) => void;
    explain: (reasons: string[]) => void;
    /** Hides the rating strip for this picture without recording a
        verdict. */
    dismiss: () => void;
  };
  /** The level's generations are used up: Generate stays off. */
  exhausted: boolean;
  generate: () => void;
  /** The style and the kind the host's own paint entry would start from. */
  draft: {imageType: ImageType; subject?: ImageSubject; style: ImageStyle};
}

interface SentenceSceneProps {
  /** A character set shows this frame, still, instead of playing. */
  stillFrame?: number;
  imageType: ImageType;
  imageSubject?: ImageSubject;
  /** Generations the student has left; Generate goes off at none. */
  generationsLeft?: number;
  /** The words the image was made with, put back as far as the sentence
      still holds them. */
  initialChoices?: SavedChoices;
  /** Where the Animated switch starts; on unless given. */
  initialAnimated?: boolean;
  /** The student turned Animated on or off. */
  onAnimatedChange?: (animated: boolean) => void;
  /** Called with each generated picture as soon as it is shown, and again
      with the verdict added to its generation metadata when the student
      rates it. */
  onKeep: (result: GeneratedImageResult) => Promise<void> | void;
  /** Called when a generation request is sent to the model. */
  onGenerateStart?: () => void;
  /** The scene is making or keeping a picture, or has stopped; a host can
      hold its other controls still meanwhile. */
  onBusyChange?: (busy: boolean) => void;
  /** The level checks that the picture was rated. */
  ratingRequired?: boolean;
  /** Analytics: which surface generated. */
  method?: string;
  /** Lays the parts out. */
  layout: (parts: SentenceSceneParts) => React.ReactNode;
  /** How the word menus lay their words out; the carousel unless given. */
  wordLayout?: WordLayout;
  /** Behind the scenes as an icon alone, for a host's header. */
  compactBehindTheScenes?: boolean;
  advanced?: AdvancedOptions;
  /** Where a sentence's picture comes from (imageCache.ts); the tree first
      when unset. A typed prompt always goes to the model. */
  imageSource?: ImageSource;
  /** Another tree to read cached pictures from (QA). */
  imageCacheUrl?: string;
}

const SentenceScene: React.FunctionComponent<SentenceSceneProps> = ({
  stillFrame,
  imageType,
  imageSubject,
  generationsLeft,
  initialChoices,
  initialAnimated = true,
  onAnimatedChange,
  onKeep,
  onGenerateStart,
  onBusyChange,
  ratingRequired = false,
  method = 'scene',
  layout,
  wordLayout,
  compactBehindTheScenes,
  advanced,
  imageSource = 'cached',
  imageCacheUrl,
}) => {
  const style = STYLE;
  const sentence = sentenceFor(imageType, imageSubject);
  const [choices, setChoices] = useState<Choices>(() =>
    restoreChoices(sentence, initialChoices)
  );
  const typedPrompt = advanced?.prompt?.trim() || '';
  const complete = !!typedPrompt || isComplete(sentence, choices);
  // A character can be animated, and is unless Animated is turned off; an
  // object, a background or a typed prompt always produces a single still
  // picture.
  const canAnimate = imageType === 'sprite' && imageSubject !== 'object';
  const [animated, setAnimated] = useState(initialAnimated);
  const generatesCharacterSet = canAnimate && animated && !typedPrompt;

  const [mode, setMode] = useState<Mode>('edit');
  const [tip, setTip] = useState<string | null>(null);
  // The most recent generated picture, shown in the frame; the host has
  // already stored it as the project's image.
  const [chosenPicture, setChosenPicture] = useState<GeneratedPicture | null>(
    null
  );
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [ratingDismissed, setRatingDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Counts runs; a superseded run's result is dropped.
  const runRef = useRef(0);
  useEffect(() => () => void runRef.current++, []);
  const exhausted = generationsLeft !== undefined && generationsLeft <= 0;
  // The cached variant shown last for a filling, so Generate again shows
  // another.
  const lastCachedRef = useRef<{path: string; variant: number}>();

  // The cached picture for the sentence as filled, when the tree has one.
  const findCached = useCallback(async (): Promise<CachedImage | undefined> => {
    const wordIds = sentenceWordIds(sentence, choices);
    const path = sentencePath(sentence.id, wordIds, style);
    const last = lastCachedRef.current;
    const found = await findCachedImage({
      sentenceId: sentence.id,
      wordIds,
      style,
      characterSet: canAnimate,
      avoidVariant: last?.path === path ? last.variant : undefined,
      baseUrl: imageCacheUrl,
    });
    if (found) {
      lastCachedRef.current = {path, variant: found.variant};
    }
    return found;
  }, [sentence, choices, style, canAnimate, imageCacheUrl]);

  const persist = useCallback(
    async (picture: GeneratedPicture, pictureVerdict: Verdict | null) => {
      setSaving(true);
      // A verdict, when given, is saved in the image's generation metadata,
      // which travels with the project.
      const result = pictureVerdict
        ? {
            ...picture.result,
            generation: {...picture.result.generation, verdict: pictureVerdict},
          }
        : picture.result;
      try {
        await onKeep(result);
      } catch (e) {
        console.error('Saving the image failed:', e);
        setError("Couldn't save the picture. Try again.");
      } finally {
        setSaving(false);
      }
    },
    [onKeep]
  );

  const generate = useCallback(async () => {
    if (exhausted) {
      return;
    }
    const run = ++runRef.current;
    const startedAt = Date.now();
    const prompt = typedPrompt || promptText(sentence, choices);
    const pixelScale = advanced?.pixelScale || 1;
    // The cache holds the sentences' pictures as the level draws them;
    // whatever the advanced settings change goes to the model.
    const customized =
      !!typedPrompt || !!advanced?.startFrom || pixelScale !== 1;
    const fromCache = imageSource === 'cached' && !customized;
    setMode('generating');
    setTip(current => pickTip(current));
    setVerdict(null);
    setRatingDismissed(false);
    setError(null);
    playSound('go');
    // A filling the tree lacks, or a lookup that fails, goes to the model.
    let cached: CachedImage | undefined;
    if (fromCache) {
      try {
        cached = await findCached();
      } catch (e) {
        console.warn('Image cache lookup failed:', e);
      }
      if (run !== runRef.current) {
        return;
      }
    }
    // true attaches the project context for per-level breakdowns.
    analyticsReporter.sendEvent(
      EVENTS.HOAI2026_IMAGE_PROMPT,
      {
        promptText: prompt,
        method: typedPrompt ? 'freeText' : method,
        imageType,
        ...(typedPrompt ? {} : {sentenceId: sentence.id, choices}),
        style,
        imageSource,
        cached: !!cached,
      },
      true
    );
    onGenerateStart?.();
    try {
      const options: GenerateImageOptions = {
        imageType,
        ...(imageType === 'sprite' && {subject: imageSubject ?? 'character'}),
        style,
        temperature: TEMPERATURE,
        ...(style === 'pixel' && {
          pixelGrid: defaultPixelGrid(imageType) / pixelScale,
        }),
      };
      if (advanced?.startFrom) {
        const dataURI = await advanced.startFrom();
        if (!dataURI) {
          throw new Error("Couldn't read the current image.");
        }
        options.inputImageDataURI = dataURI;
      }
      const bodyPlan = typedPrompt
        ? undefined
        : chosenBodyPlan(sentence, choices);
      // What the lab would send. A cached picture was made from the same
      // words by the same prompt builders, so this describes it as well.
      const sent: SentPrompts = sentPromptsFor(
        prompt,
        options,
        style,
        generatesCharacterSet,
        bodyPlan
      );
      const result = generatesCharacterSet
        ? await generateCharacterSet(prompt, {
            style,
            temperature: TEMPERATURE,
            pixelGrid: options.pixelGrid,
            bodyPlan,
            cached,
          })
        : await generateImage(prompt, {...options, cached});
      if (run !== runRef.current) {
        return;
      }
      if (cached) {
        const elapsed = Date.now() - startedAt;
        await new Promise(resolve =>
          setTimeout(resolve, Math.max(MIN_CACHED_GENERATING_MS - elapsed, 0))
        );
        if (run !== runRef.current) {
          return;
        }
      }
      // The chosen words are stored in the image's generation metadata so
      // the sentence can be refilled when the image is reopened; a typed
      // prompt has no words to store.
      const chosenWords = typedPrompt
        ? undefined
        : Object.fromEntries(
            Object.entries(choices).filter(
              (pair): pair is [string, string] => typeof pair[1] === 'string'
            )
          );
      const entry: GeneratedPicture = {
        id: result.filename,
        result: chosenWords
          ? {
              ...result,
              generation: {
                ...result.generation,
                sentenceId: sentence.id,
                choices: chosenWords,
              },
            }
          : result,
        dataURI: bytesToDataURI(result.uint8Array, result.mediaType),
        prompt,
        sent,
        cached: !!cached,
      };
      setChosenPicture(entry);
      setMode('result');
      playSound('reveal');
      await persist(entry, null);
    } catch (e) {
      if (run !== runRef.current) {
        return;
      }
      if (e instanceof ImageSafetyError) {
        setError(
          e.phase === 'prompt'
            ? "Those words aren't okay for class. Try different ones."
            : "That picture didn't pass our safety check. Try again."
        );
      } else {
        console.error('Image generation failed:', e);
        setError("Couldn't make the picture. Try again.");
      }
      setMode('edit');
    }
  }, [
    sentence,
    choices,
    typedPrompt,
    imageType,
    imageSubject,
    style,
    generatesCharacterSet,
    method,
    onGenerateStart,
    exhausted,
    advanced,
    persist,
    imageSource,
    findCached,
  ]);

  const judge = useCallback(
    (next: Verdict) => {
      setVerdict(next);
      playSound(next === 'up' ? 'cheer' : 'hmm');
      if (chosenPicture) {
        persist(chosenPicture, next);
      }
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_VERDICT,
        {
          verdict: next,
          promptText: chosenPicture?.prompt,
          imageType,
        },
        true
      );
    },
    [chosenPicture, imageType, persist]
  );

  // Giving reasons finishes the rating; the rating strip is hidden
  // afterwards.
  const explain = useCallback(
    (reasons: string[]) => {
      setRatingDismissed(true);
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_VERDICT_REASON,
        {
          reasons,
          promptText: chosenPicture?.prompt,
          imageType,
        },
        true
      );
    },
    [chosenPicture, imageType]
  );

  const generating = mode === 'generating';
  const busy = generating || saving;
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  const menus = useWordMenus({
    sentence,
    choices,
    onChange: setChoices,
    disabled: busy,
    layout: wordLayout,
  });
  const showingResult = mode === 'result' && !!chosenPicture;

  // The control that changed the mode unmounts with it, so focus moves to
  // the panel; not on the first render, which is the level opening.
  const panelRef = useRef<HTMLElement>(null);
  const firstModeRef = useRef(true);
  useEffect(() => {
    if (firstModeRef.current) {
      firstModeRef.current = false;
      return;
    }
    panelRef.current?.focus();
  }, [mode]);
  const status = generating
    ? 'Making your picture…'
    : showingResult
    ? 'Your picture is ready.'
    : '';

  const errorLine = error && (
    <MuiTypography variant="body2" className={styles.error} role="alert">
      {error}
    </MuiTypography>
  );
  const sheet =
    chosenPicture?.result.frames?.poses && chosenPicture.result.frames
      ? {
          src: chosenPicture.dataURI,
          frameSize: chosenPicture.result.frames.frameSize,
          poses: chosenPicture.result.frames.poses,
        }
      : null;

  const statusNode = (
    <div className={styles.srOnly} role="status">
      {status}
    </div>
  );
  // The word chooser stays usable after a picture is made, so Regenerate
  // can run with changed or unchanged words.
  const sentenceOpen = !generating;
  const sentenceNode = sentenceOpen ? (
    menus.sentence
  ) : (
    <SentenceReadOnly sentence={sentence} choices={choices} />
  );
  const wordChooserNode = sentenceOpen ? menus.chooser : null;
  const animatedChoiceNode = canAnimate && !typedPrompt && !generating && (
    <div className={styles.animatedRow}>
      <Toggle
        label="Animated"
        name="sentence-animated"
        position="right"
        size="s"
        checked={animated}
        disabled={busy}
        onChange={e => {
          setAnimated(e.target.checked);
          onAnimatedChange?.(e.target.checked);
        }}
      />
    </div>
  );
  // A set's frames arrive one by one; none shows until all have.
  const frame = generating ? (
    <div className={styles.generating}>
      <FontAwesomeV6Icon
        iconName="spinner"
        animationType="spin"
        className={styles.spinner}
        aria-hidden
      />
    </div>
  ) : chosenPicture ? (
    <>
      {sheet && stillFrame !== undefined ? (
        <StripFrame
          sheetSrc={sheet.src}
          frameSize={sheet.frameSize}
          index={stillFrame}
          className={styles.preview}
          label={chosenPicture.prompt}
        />
      ) : sheet ? (
        <AnimatedSheetPreview {...sheet} />
      ) : (
        <img
          src={chosenPicture.dataURI}
          alt={chosenPicture.prompt}
          className={classNames(
            styles.preview,
            chosenPicture.result.pixelGridSize && styles.pixelArt
          )}
        />
      )}
      {/* Keyed by picture, so each new one remounts and plays the reveal
          once. */}
      <PixelReveal
        key={`reveal-${chosenPicture.id}`}
        src={chosenPicture.dataURI}
        crop={
          sheet
            ? {
                // A generated set's frames stand in one row.
                ...stripCellOrigin(
                  CHARACTER_STRIP_FRAME_COUNT * sheet.frameSize.x,
                  sheet.frameSize,
                  stillFrame ?? 0
                ),
                width: sheet.frameSize.x,
                height: sheet.frameSize.y,
              }
            : undefined
        }
      />
      <SparkleBurst key={`burst-${chosenPicture.id}`} />
    </>
  ) : null;

  const behindTheScenes = showingResult && chosenPicture && (
    <BehindTheScenes
      sent={chosenPicture.sent}
      picture={{
        src: chosenPicture.dataURI,
        pixelated: !!chosenPicture.result.pixelGridSize,
        sheet: sheet && {frameSize: sheet.frameSize},
        name: chosenPicture.prompt,
      }}
      disabled={busy}
      compact={compactBehindTheScenes}
    />
  );
  const ratingOffered = showingResult && !!chosenPicture && !ratingDismissed;
  const dismissRating = useCallback(() => setRatingDismissed(true), []);

  return (
    <>
      {layout({
        mode,
        busy,
        complete,
        panelRef,
        frame,
        frameFilled: !!chosenPicture && !generating,
        // Keyed like the reveal, so each picture shows it afresh.
        cachedTag: chosenPicture?.cached && !generating && (
          <span key={`cached-${chosenPicture.id}`} className={styles.cachedTag}>
            cached
          </span>
        ),
        behindTheScenes,
        status: statusNode,
        sentence: sentenceNode,
        wordChooser: wordChooserNode,
        animatedChoice: animatedChoiceNode,
        error: errorLine,
        tip: generating ? tip : null,
        rating: {
          offered: ratingOffered,
          required: ratingRequired,
          verdict,
          judge,
          explain,
          dismiss: dismissRating,
        },
        exhausted,
        generate,
        draft: {imageType, subject: imageSubject, style},
      })}
    </>
  );
};

export default SentenceScene;
