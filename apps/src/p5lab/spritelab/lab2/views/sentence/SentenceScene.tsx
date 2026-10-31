// Making a picture from a sentence of word chips: the words, the model's
// run, the pictures it made, and the rating. A host lays the parts out.

import Checkbox from '@code-dot-org/component-library/checkbox';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {generateCharacterSet} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {bytesToDataURI} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {
  GeneratedImageResult,
  generateImage,
  GenerateImageOptions,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {
  IMAGE_KINDS,
  imageKindFor,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageKinds';
import {ImageSafetyError} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageSafety';
import {defaultPixelGrid} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {
  imageKindLabel,
  ImageStyle,
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

import AnimatedSheetPreview from '../AnimatedSheetPreview';

import AlternativeThumbs from './AlternativeThumbs';
import BehindTheScenes from './BehindTheScenes';
import FiringBlob from './FiringBlob';
import GeneratingSteps from './GeneratingSteps';
import {PixelReveal, SparkleBurst} from './PixelReveal';
import SentenceReadOnly from './SentenceReadOnly';
import {
  Choices,
  chosenBodyPlan,
  isComplete,
  promptText,
  sentenceFor,
} from './sentences';
import {playSound} from './sentenceSounds';
import {SentPrompts, sentPromptsFor} from './sentPrompts';
import {Verdict} from './verdict';
import {slotLineColors} from './wordHues';
import {WordLayout} from './wordLayout';
import WordMenus from './WordMenus';

import styles from './sentence-scene.module.scss';

// Every picture is pixel art.
const STYLE: ImageStyle = 'pixel';
// The service's middle temperature.
const TEMPERATURE = 1;
// The last step's tick shows this long before the picture replaces it.
const SETTLE_MS = 500;

export type Mode = 'edit' | 'generating' | 'result';

interface GeneratedPicture {
  /** The result's filename, unique per generation. */
  id: string;
  result: GeneratedImageResult;
  dataURI: string;
  /** The student's words. */
  prompt: string;
  /** The words as the model got them, for "Behind the scenes". */
  sent: SentPrompts;
}

/** Knobs behind the advanced switch: a typed prompt in place of the words,
    a coarser pixel grid, and the current picture as the starting point. */
export interface AdvancedOptions {
  /** Typed text wins over the words while present, and makes one still
      picture. */
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
  /** The picture, the making of it, or nothing. */
  frame: React.ReactNode;
  /** A made picture is showing in the frame. */
  frameFilled: boolean;
  /** Behind the scenes, once there is a picture. */
  underFrame: React.ReactNode;
  /** The session's pictures as a column of tiles down the frame's left,
      the one in the frame marked. */
  alternatives: React.ReactNode;
  /** The screen reader's status line. */
  status: React.ReactNode;
  /** The Type dropdown, when the host offers the choice. */
  typeChoice: React.ReactNode;
  /** The word menus, or the sentence read back while busy. */
  sentence: React.ReactNode;
  /** The Animated checkbox, for a character. */
  animatedChoice: React.ReactNode;
  error: React.ReactNode;
  /** The model's steps, while generating. */
  progress: React.ReactNode;
  /** The rating: offered while a fresh picture (or, when the level rates
      every one, any picture) is in the frame. */
  rating: {
    offered: boolean;
    verdict: Verdict | null;
    judge: (verdict: Verdict) => void;
    explain: (reasons: string[]) => void;
  };
  /** The level's generations are used up: Generate stays off. */
  exhausted: boolean;
  generate: () => void;
  changeWords: () => void;
  /** The style and the kind the host's own paint entry would start from. */
  draft: {imageType: ImageType; subject?: ImageSubject; style: ImageStyle};
}

interface SentenceSceneProps {
  imageType: ImageType;
  imageSubject?: ImageSubject;
  /** The sentence to build, by id; the image type's own when unset. */
  sentenceId?: string;
  /** Generations the student has left; Generate goes off at none. */
  generationsLeft?: number;
  /** Offer the Type dropdown; imageType and imageSubject are then where it
      starts. */
  typeChoice?: boolean;
  /** Every picture that lands in the frame is kept at once, and again with
      its rating when one is given. */
  onKeep: (result: GeneratedImageResult) => Promise<void> | void;
  /** A generation request is leaving. */
  onGenerateStart?: () => void;
  /** Analytics: which surface generated. */
  method?: string;
  /** The level asks for a rating of every picture. */
  verdictRequired?: boolean;
  /** Lays the parts out. */
  layout: (parts: SentenceSceneParts) => React.ReactNode;
  /** How the word menus lay their words out; the carousel unless given. */
  wordLayout?: WordLayout;
  /** The model's steps one at a time, each replacing the last. */
  singleStep?: boolean;
  /** Behind the scenes as an icon alone, for a host's header. */
  compactBehindTheScenes?: boolean;
  advanced?: AdvancedOptions;
}

const SentenceScene: React.FunctionComponent<SentenceSceneProps> = ({
  imageType: initialImageType,
  imageSubject: initialImageSubject,
  sentenceId,
  generationsLeft,
  typeChoice,
  onKeep,
  onGenerateStart,
  method = 'scene',
  verdictRequired,
  layout,
  wordLayout,
  singleStep,
  compactBehindTheScenes,
  advanced,
}) => {
  const {theme} = useTheme();
  const style = STYLE;
  const [kind, setKind] = useState(
    () => imageKindFor(initialImageType, initialImageSubject).value
  );
  const {imageType, subject: imageSubject} = typeChoice
    ? IMAGE_KINDS.find(k => k.value === kind) ?? IMAGE_KINDS[0]
    : {imageType: initialImageType, subject: initialImageSubject};
  const sentence = sentenceFor(imageType, imageSubject, sentenceId);
  const [choices, setChoices] = useState<Choices>({});
  const typedPrompt = advanced?.prompt?.trim() || '';
  const complete = !!typedPrompt || isComplete(sentence, choices);
  // A character can be animated, and is unless the box is unticked; an
  // object, a background or a typed prompt is one picture.
  const canAnimate = imageType === 'sprite' && imageSubject !== 'object';
  const [animated, setAnimated] = useState(true);
  const makesSet = canAnimate && animated && !typedPrompt;

  const [mode, setMode] = useState<Mode>('edit');
  // Every picture made this session; the chosen one shows in the frame
  // and is the image.
  const [history, setHistory] = useState<GeneratedPicture[]>([]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const chosenPicture = history.find(m => m.id === chosenId) ?? null;
  // The picture just generated plays the reveal and is asked about; one
  // swapped back in from the strip does neither.
  const [freshId, setFreshId] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // The picture is back and the last step's tick is showing.
  const [settling, setSettling] = useState(false);
  // Counts runs; a superseded run's result is dropped.
  const runRef = useRef(0);
  useEffect(() => () => void runRef.current++, []);
  const exhausted = generationsLeft !== undefined && generationsLeft <= 0;

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
    const prompt = typedPrompt || promptText(sentence, choices);
    // true attaches the project context for per-level breakdowns.
    analyticsReporter.sendEvent(
      EVENTS.HOAI2026_IMAGE_PROMPT,
      {
        promptText: prompt,
        method: typedPrompt ? 'freeText' : method,
        imageType,
        ...(typedPrompt ? {} : {sentenceId: sentence.id, choices}),
        style,
      },
      true
    );
    onGenerateStart?.();
    setMode('generating');
    setSettling(false);
    setVerdict(null);
    setError(null);
    playSound('go');
    try {
      const pixelScale = advanced?.pixelScale || 1;
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
      const sent: SentPrompts = sentPromptsFor(
        prompt,
        options,
        style,
        makesSet,
        bodyPlan
      );
      const result = makesSet
        ? await generateCharacterSet(prompt, {
            style,
            temperature: TEMPERATURE,
            pixelGrid: options.pixelGrid,
            bodyPlan,
          })
        : await generateImage(prompt, options);
      if (run !== runRef.current) {
        return;
      }
      setSettling(true);
      await new Promise(resolve => setTimeout(resolve, SETTLE_MS));
      if (run !== runRef.current) {
        return;
      }
      const entry: GeneratedPicture = {
        id: result.filename,
        result,
        dataURI: bytesToDataURI(result.uint8Array, result.mediaType),
        prompt,
        sent,
      };
      setHistory(current => [...current, entry]);
      setChosenId(entry.id);
      setFreshId(entry.id);
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
    makesSet,
    method,
    onGenerateStart,
    exhausted,
    advanced,
    persist,
  ]);

  // Back to the words with the picture still showing; the next Generate
  // replaces it.
  const changeWords = useCallback(() => {
    setMode('edit');
  }, []);

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

  const explain = useCallback(
    (reasons: string[]) => {
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

  // Another picture from the strip into the frame: no reveal, and the
  // rating given so far was for the previous picture.
  const choosePicture = useCallback(
    (id: string) => {
      setChosenId(id);
      setFreshId(null);
      setVerdict(null);
      const picture = history.find(m => m.id === id);
      if (picture) {
        persist(picture, null);
      }
    },
    [history, persist]
  );

  const generating = mode === 'generating';
  const busy = generating || saving;
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
  // The blob's signal colors, read under the host's theme as a run starts.
  const [signalColors, setSignalColors] = useState<string[]>([]);
  useEffect(() => {
    if (generating && panelRef.current) {
      setSignalColors(slotLineColors(sentence, panelRef.current));
    }
  }, [generating, sentence]);
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

  const typeChoiceNode = typeChoice ? (
    <SimpleDropdown
      name="sentence-type"
      labelText="Type"
      isLabelVisible={false}
      size="s"
      color={theme === 'Dark' ? 'white' : 'black'}
      items={IMAGE_KINDS.map(k => ({
        value: k.value,
        text: imageKindLabel(k.imageType, k.subject),
      }))}
      selectedValue={kind}
      disabled={busy}
      onChange={e => {
        setKind(e.target.value);
        // A new sentence takes new words.
        setChoices({});
      }}
    />
  ) : null;
  const statusNode = (
    <div className={styles.srOnly} role="status">
      {status}
    </div>
  );
  const sentenceNode =
    showingResult || generating ? (
      <SentenceReadOnly sentence={sentence} choices={choices} />
    ) : (
      <WordMenus
        sentence={sentence}
        choices={choices}
        onChange={setChoices}
        disabled={busy}
        layout={wordLayout}
      />
    );
  const animatedChoiceNode = canAnimate &&
    !typedPrompt &&
    !generating &&
    !showingResult && (
      <Checkbox
        label="Animated"
        name="sentence-animated"
        size="s"
        checked={animated}
        disabled={busy}
        onChange={e => setAnimated(e.target.checked)}
      />
    );
  const progressNode = generating && (
    <GeneratingSteps done={settling} single={singleStep} />
  );

  // A set's frames arrive one by one; none shows until all have.
  const frame = generating ? (
    <div className={styles.generating}>
      <FiringBlob colors={signalColors} />
    </div>
  ) : chosenPicture ? (
    <>
      {sheet ? (
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
      {chosenPicture.id === freshId && (
        <>
          <PixelReveal
            key={`reveal-${chosenPicture.id}`}
            src={chosenPicture.dataURI}
            crop={
              sheet
                ? {
                    x: 0,
                    y: 0,
                    width: sheet.frameSize.x,
                    height: sheet.frameSize.y,
                  }
                : undefined
            }
          />
          <SparkleBurst key={`burst-${chosenPicture.id}`} />
        </>
      )}
    </>
  ) : null;

  const underFrame = showingResult && chosenPicture && (
    <BehindTheScenes
      sent={chosenPicture.sent}
      disabled={busy}
      compact={compactBehindTheScenes}
    />
  );
  // Stays through editing and generating, so the frame does not shift.
  const alternativesNode = history.length > 1 && (
    <AlternativeThumbs
      thumbs={history.map(m => ({
        id: m.id,
        src: m.dataURI,
        prompt: m.prompt,
        crop: m.result.frames?.poses
          ? {
              width: m.result.frames.frameSize.x,
              height: m.result.frames.frameSize.y,
            }
          : undefined,
        pixelArt: !!m.result.pixelGridSize,
      }))}
      chosenId={chosenId}
      onChoose={choosePicture}
      disabled={busy}
    />
  );
  const ratingOffered =
    showingResult &&
    !!chosenPicture &&
    (chosenPicture.id === freshId || !!verdictRequired);

  return (
    <>
      {layout({
        mode,
        busy,
        complete,
        panelRef,
        frame,
        frameFilled: !!chosenPicture && !generating,
        underFrame,
        alternatives: alternativesNode,
        status: statusNode,
        typeChoice: typeChoiceNode,
        sentence: sentenceNode,
        animatedChoice: animatedChoiceNode,
        error: errorLine,
        progress: progressNode,
        rating: {offered: ratingOffered, verdict, judge, explain},
        exhausted,
        generate,
        changeWords,
        draft: {imageType, subject: imageSubject, style},
      })}
    </>
  );
};

export default SentenceScene;
