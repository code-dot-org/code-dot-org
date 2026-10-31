// An image level laid out as two halves: the picture on the left, the
// controls on the right. A host with its own chrome (the image dialog)
// passes a layout that places the same parts itself.

import Checkbox from '@code-dot-org/component-library/checkbox';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {generateCharacterSet} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {bytesToDataURI} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {
  GeneratedImageResult,
  generateImage,
  GenerateImageOptions,
  UploadImageFunction,
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
import {
  BACKGROUND_GROUND_COLOR,
  blankPaintImage,
} from '@cdo/apps/p5lab/spritelab/lab2/paintBlank';
import PixelEditor from '@cdo/apps/pixelEditor/PixelEditor';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import characterOutline from '@cdo/static/spritelab_lab2/character-outline.svg';

import AnimatedSheetPreview from '../AnimatedSheetPreview';

import AlternativeThumbs from './AlternativeThumbs';
import BehindTheScenes from './BehindTheScenes';
import FiringBlob from './FiringBlob';
import GeneratingSteps from './GeneratingSteps';
import {PAINT_BRUSH_SIZES, PAINT_COLORS, PAINT_TOOLS} from './paintTools';
import {PixelReveal, SparkleBurst} from './PixelReveal';
import ResultActions, {
  Verdict,
  VerdictReason,
  VerdictRow,
} from './ResultActions';
import {saveGeneratedImage, savePaintedImage} from './saveGeneratedImage';
import {pickFact} from './sentenceFacts';
import SentenceReadOnly from './SentenceReadOnly';
import {
  Choices,
  chosenBodyPlan,
  isComplete,
  promptText,
  sentenceFor,
} from './sentences';
import SentenceSceneLayout from './SentenceSceneLayout';
import {playSound} from './sentenceSounds';
import {SentPrompts, sentPromptsFor} from './sentPrompts';
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

export type Mode = 'edit' | 'generating' | 'result' | 'paint';

interface GeneratedPicture {
  /** The result's filename, unique per generation. */
  id: string;
  result: GeneratedImageResult;
  dataURI: string;
  /** The student's sentence. */
  prompt: string;
  /** The words as the model got them, for "Behind the scenes". */
  sent: SentPrompts;
}

/** What a host lays out. The nodes are ready to place; the callbacks and
    flags let a host draw its own buttons. */
export interface SentenceSceneParts {
  mode: Mode;
  busy: boolean;
  /** Every word the sentence needs is chosen. */
  complete: boolean;
  panelRef: React.RefObject<HTMLElement>;
  /** The picture, the spinner, or nothing. */
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
  fact: React.ReactNode;
  /** The question and the thumbs, once there is a picture. */
  verdict: React.ReactNode;
  /** The rating as state, for a host that draws its own thumbs: offered
      while a fresh picture (or, when the level rates every one, any
      picture) is in the frame. */
  rating: {
    offered: boolean;
    verdict: Verdict | null;
    judge: (verdict: Verdict) => void;
    explain: (reasons: string[]) => void;
  };
  /** Some levels require the student's verdict on whether the generated
      picture is good or bad before it can be kept; true while that verdict
      is still owed. */
  awaitingVerdict: boolean;
  /** The level's generations are used up: Generate stays off. */
  exhausted: boolean;
  generate: () => void;
  changeWords: () => void;
  keep: () => void;
  /** The style and the kind the host's own paint entry would start from. */
  draft: {imageType: ImageType; subject?: ImageSubject; style: ImageStyle};
}

interface SentenceSceneProps {
  imageType: ImageType;
  imageSubject?: ImageSubject;
  /** The sentence to build, by id; the image type's own when unset. */
  sentenceId?: string;
  /** Recorded on the saved image. */
  imageRole?: string;
  uploadImage?: UploadImageFunction;
  /** The level's instructions, markdown, read at the top of the panel. */
  instructions?: string;
  /** What the panel reads instead once a picture is made. */
  resultInstructions?: string;
  /** Generations the student has left; Generate goes off at none. */
  generationsLeft?: number;
  /** Offer the read-aloud button on the instructions. */
  showTts?: boolean;
  /** Offer the Type dropdown; imageType and imageSubject are then where it
      starts. */
  typeChoice?: boolean;
  /** Keep a made picture; the level's own saving when unset. */
  onKeep?: (result: GeneratedImageResult) => Promise<void> | void;
  /** A generation request is leaving. */
  onGenerateStart?: () => void;
  /** Analytics: which surface generated. */
  method?: string;
  /** The level requires the student to rate each generated picture before
      keeping it (a `rated` objective). Most levels do not. */
  verdictRequired?: boolean;
  /** Called whenever awaitingVerdict changes, so the owner can hold the
      dialog open until the rating is in. */
  onAwaitingVerdict?: (awaiting: boolean) => void;
  /** Lay the parts out instead of the level's two halves. */
  layout?: (parts: SentenceSceneParts) => React.ReactNode;
  /** Every picture that lands in the frame is kept through onKeep at once,
      and again with its rating when one is given; there is no Keep step. */
  keepOnResult?: boolean;
  /** How the word menus lay their words out; the carousel unless given. */
  wordLayout?: WordLayout;
  /** The model's steps one at a time, each replacing the last. */
  singleStep?: boolean;
  /** Behind the scenes as an icon alone, for a host's header. */
  compactBehindTheScenes?: boolean;
}

const SentenceScene: React.FunctionComponent<SentenceSceneProps> = ({
  imageType: initialImageType,
  imageSubject: initialImageSubject,
  sentenceId,
  imageRole,
  uploadImage,
  instructions,
  resultInstructions,
  generationsLeft,
  showTts,
  typeChoice,
  onKeep,
  onGenerateStart,
  method = 'scene',
  verdictRequired,
  onAwaitingVerdict,
  layout,
  keepOnResult,
  wordLayout,
  singleStep,
  compactBehindTheScenes,
}) => {
  const dispatch = useAppDispatch();
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
  const complete = isComplete(sentence, choices);
  // A character can be animated, and is unless the box is unticked; an
  // object or a background is one picture.
  const canAnimate = imageType === 'sprite' && imageSubject !== 'object';
  const [animated, setAnimated] = useState(true);
  const makesSet = canAnimate && animated;

  const [mode, setMode] = useState<Mode>('edit');
  // Every picture made this session; the chosen one shows in the frame
  // and is what Keep saves.
  const [history, setHistory] = useState<GeneratedPicture[]>([]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const chosenPicture = history.find(m => m.id === chosenId) ?? null;
  // freshId marks the picture just generated: it plays the reveal and gets
  // the rating question. A picture swapped back in from the strip does
  // neither.
  const [freshId, setFreshId] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const awaitingVerdict =
    !!verdictRequired && mode === 'result' && !!chosenPicture && !verdict;
  useEffect(() => {
    onAwaitingVerdict?.(awaitingVerdict);
  }, [awaitingVerdict, onAwaitingVerdict]);
  // On unmount, tell the owner that no rating is pending any more.
  useEffect(() => () => onAwaitingVerdict?.(false), [onAwaitingVerdict]);
  const [reason, setReason] = useState<VerdictReason | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fact, setFact] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // The picture is back and the last step's tick is showing.
  const [settling, setSettling] = useState(false);
  // The blank the student draws on, sized for the style.
  const [paintFrom, setPaintFrom] = useState<{
    dataURI: string;
    pixelGridSize?: number;
  } | null>(null);
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
        if (onKeep) {
          await onKeep(result);
        } else {
          await saveGeneratedImage(dispatch, result, {
            uploadImage,
            imageType,
            imageRole,
          });
          dispatch(continueOrFinishLesson());
        }
      } catch (e) {
        console.error('Saving the image failed:', e);
        setError("Couldn't save the picture. Try again.");
      } finally {
        // On the last level with no finish URL, the lesson does not move on.
        setSaving(false);
      }
    },
    [onKeep, dispatch, uploadImage, imageType, imageRole]
  );

  const generate = useCallback(async () => {
    if (exhausted) {
      return;
    }
    const run = ++runRef.current;
    const prompt = promptText(sentence, choices);
    // true attaches the project context for per-level breakdowns.
    analyticsReporter.sendEvent(
      EVENTS.HOAI2026_IMAGE_PROMPT,
      {
        promptText: prompt,
        method,
        imageType,
        sentenceId: sentence.id,
        choices,
        style,
      },
      true
    );
    onGenerateStart?.();
    setMode('generating');
    setSettling(false);
    setVerdict(null);
    setReason(null);
    setError(null);
    setFact(current =>
      pickFact(
        {animated: makesSet, pixel: style === 'pixel'},
        current ?? undefined
      )
    );
    playSound('go');
    try {
      const options: GenerateImageOptions = {
        imageType,
        ...(imageType === 'sprite' && {subject: imageSubject ?? 'character'}),
        style,
        temperature: TEMPERATURE,
        ...(style === 'pixel' && {pixelGrid: defaultPixelGrid(imageType)}),
      };
      const bodyPlan = chosenBodyPlan(sentence, choices);
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
      if (keepOnResult) {
        await persist(entry, null);
      }
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
    imageType,
    imageSubject,
    style,
    makesSet,
    method,
    onGenerateStart,
    exhausted,
    keepOnResult,
    persist,
  ]);

  const keep = useCallback(async () => {
    if (!chosenPicture || awaitingVerdict) {
      return;
    }
    await persist(chosenPicture, verdict);
  }, [chosenPicture, awaitingVerdict, verdict, persist]);

  const startPaint = useCallback(() => {
    setError(null);
    setPaintFrom(blankPaintImage(imageType, style));
    setMode('paint');
  }, [imageType, style]);

  const cancelPaint = useCallback(() => {
    setPaintFrom(null);
    setMode('edit');
  }, []);

  const savePaint = useCallback(
    async (dataURI: string, meta: {pixelGridSize?: number}) => {
      setSaving(true);
      try {
        await savePaintedImage(dispatch, dataURI, meta.pixelGridSize, {
          uploadImage,
          imageType,
          imageRole,
        });
        dispatch(continueOrFinishLesson());
      } catch (e) {
        console.error('Saving the drawing failed:', e);
        setError("Couldn't save the drawing. Try again.");
      } finally {
        setSaving(false);
      }
    },
    [dispatch, uploadImage, imageType, imageRole]
  );

  // Back to the words with the picture still showing; the next Generate
  // replaces it.
  const changeWords = useCallback(() => {
    setMode('edit');
  }, []);

  const judge = useCallback(
    (next: Verdict) => {
      setVerdict(next);
      setReason(null);
      playSound(next === 'up' ? 'cheer' : 'hmm');
      if (keepOnResult && chosenPicture) {
        persist(chosenPicture, next);
      }
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_VERDICT,
        {
          verdict: next,
          promptText: chosenPicture ? promptText(sentence, choices) : undefined,
          imageType,
        },
        true
      );
    },
    [chosenPicture, sentence, choices, imageType, keepOnResult, persist]
  );

  const explain = useCallback(
    (next: VerdictReason) => {
      setReason(next);
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_VERDICT_REASON,
        {
          reason: next,
          promptText: chosenPicture ? promptText(sentence, choices) : undefined,
          imageType,
        },
        true
      );
    },
    [chosenPicture, sentence, choices, imageType]
  );
  // A host's own question allows several reasons at once.
  const explainMany = useCallback(
    (reasons: string[]) => {
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_VERDICT_REASON,
        {
          reasons,
          promptText: chosenPicture ? promptText(sentence, choices) : undefined,
          imageType,
        },
        true
      );
    },
    [chosenPicture, sentence, choices, imageType]
  );

  // Put another picture from the strip into the frame. A swap plays no
  // reveal, and a verdict given so far was for the previous picture, so it
  // is cleared.
  const choosePicture = useCallback(
    (id: string) => {
      setChosenId(id);
      setFreshId(null);
      setVerdict(null);
      setReason(null);
      const picture = history.find(m => m.id === id);
      if (keepOnResult && picture) {
        persist(picture, null);
      }
    },
    [history, keepOnResult, persist]
  );

  const generating = mode === 'generating';
  const busy = generating || saving;
  const showingResult = mode === 'result' && !!chosenPicture;
  const canGenerate = complete && !busy && !exhausted;

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

  // No instructions text while generating, when the progress steps use the
  // panel, or while painting, since the level's instructions ask for a
  // prompt and do not apply to drawing.
  const instructionsText =
    generating || mode === 'paint'
      ? undefined
      : showingResult && resultInstructions
      ? resultInstructions
      : instructions;
  const instructionsBlock = instructionsText && (
    <MainInstructionsContent
      instructionsText={instructionsText}
      markdownClassName={styles.instructions}
      showTts={showTts}
    />
  );
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

  if (mode === 'paint' && paintFrom) {
    return (
      <PixelEditor
        imageUrl={paintFrom.dataURI}
        knownPixelGrid={paintFrom.pixelGridSize}
        tools={PAINT_TOOLS}
        palette={PAINT_COLORS}
        brushSizes={PAINT_BRUSH_SIZES}
        fit="container"
        toolbarLayout="row"
        canvasClassName={styles.paintCanvas}
        opaqueGround={
          imageType === 'background' ? BACKGROUND_GROUND_COLOR : undefined
        }
        onSave={savePaint}
      >
        {parts => (
          <SentenceSceneLayout
            frameClassName={styles.paintFrame}
            frame={
              canAnimate ? (
                // A dotted figure to draw over, gone at the first stroke.
                <div className={styles.paintStack}>
                  {parts.canvas}
                  <img
                    src={characterOutline}
                    alt=""
                    className={classNames(
                      styles.paintOutline,
                      parts.edited && styles.paintOutlineGone
                    )}
                  />
                </div>
              ) : (
                parts.canvas
              )
            }
            frameAriaLabel="Your drawing"
            panelAriaLabel="Draw your picture"
            panelRef={panelRef}
            fillFrameHeight
          >
            {instructionsBlock}
            {parts.toolbar}
            {errorLine}
            <div className={classNames(styles.paintActions, styles.bottomRow)}>
              <MuiButton
                variant="outlined"
                color="secondary"
                disabled={saving}
                onClick={cancelPaint}
              >
                Cancel
              </MuiButton>
              <MuiButton
                variant="contained"
                color="primary"
                disabled={!parts.canSave || saving}
                onClick={parts.save}
              >
                Save
              </MuiButton>
            </div>
          </SentenceSceneLayout>
        )}
      </PixelEditor>
    );
  }

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
  const animatedChoiceNode = canAnimate && !generating && !showingResult && (
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
  const factNode = generating && fact && (
    <aside
      className={classNames(styles.factBox, styles.bottomRow)}
      aria-label="Did you know?"
    >
      <FontAwesomeV6Icon
        iconName="lightbulb"
        className={styles.factIcon}
        aria-hidden
      />
      <MuiTypography variant="body2">{fact}</MuiTypography>
    </aside>
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
  const alternativesNode = mode !== 'paint' && history.length > 1 && (
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
  // The rating question. It is asked of the picture just generated while it
  // is in the frame, or of any picture in the frame when the level requires
  // a rating on every picture. `boxed` draws it in its own panel for a host
  // that lays the parts out; otherwise it sits plain among the buttons.
  const ratingOffered =
    showingResult &&
    !!chosenPicture &&
    (chosenPicture.id === freshId || !!verdictRequired);
  const verdictRow = (boxed: boolean) =>
    ratingOffered && (
      <VerdictRow
        verdict={verdict}
        onJudge={judge}
        reason={reason}
        onReason={explain}
        disabled={busy}
        boxed={boxed}
      />
    );
  // Under the frame: the way to draw instead, while the words are open.
  const drawButton = mode === 'edit' && (
    <div className={styles.underFrameRow}>
      <MuiButton
        variant="outlined"
        color="secondary"
        className={styles.drawButton}
        startIcon={<FontAwesomeV6Icon iconName="pen" aria-hidden />}
        onClick={startPaint}
      >
        I'll draw it myself
      </MuiButton>
    </div>
  );

  if (layout) {
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
          fact: factNode,
          verdict: verdictRow(true),
          rating: {
            offered: ratingOffered,
            verdict,
            judge,
            explain: explainMany,
          },
          awaitingVerdict,
          exhausted,
          generate,
          changeWords,
          keep,
          draft: {imageType, subject: imageSubject, style},
        })}
      </>
    );
  }

  return (
    <SentenceSceneLayout
      frameClassName={classNames(
        chosenPicture && !generating && styles.imageFrameFilled
      )}
      beside={alternativesNode}
      frame={frame}
      underFrame={underFrame || drawButton}
      frameAriaLabel="Your picture"
      panelAriaLabel="Make your picture"
      panelRef={panelRef}
      fillFrameHeight={!showingResult}
    >
      {statusNode}
      {instructionsBlock}
      {sentenceNode}
      {showingResult && chosenPicture ? (
        <ResultActions
          verdict={verdictRow(false)}
          onChangeWords={changeWords}
          onGenerateAgain={generate}
          onContinue={keep}
          disabled={busy}
          continueDisabled={awaitingVerdict}
          regenerateDisabled={exhausted}
        />
      ) : generating ? (
        <div className={styles.generatingSpace}>{progressNode}</div>
      ) : (
        // Held at the panel's bottom, even with the frame's; an error reads
        // above the button.
        <div className={styles.bottomRow}>
          {errorLine}
          <MuiButton
            className={classNames(
              styles.generateButton,
              canGenerate && styles.generateReady
            )}
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
            disabled={!canGenerate}
            onClick={generate}
          >
            Generate
          </MuiButton>
        </div>
      )}
      {mode !== 'edit' && errorLine}
      {factNode}
    </SentenceSceneLayout>
  );
};

export default SentenceScene;
