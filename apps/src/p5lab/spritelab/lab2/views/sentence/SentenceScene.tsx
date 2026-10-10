// An image level laid out as two halves: the picture on the left, the
// controls on the right. A host with its own chrome (the image dialog)
// passes a layout that places the same parts itself.

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
  IMAGE_STYLE_LABELS,
  imageKindLabel,
  ImageStyle,
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {
  BACKGROUND_GROUND_COLOR,
  blankPaintImage,
} from '@cdo/apps/p5lab/spritelab/lab2/paintBlank';
import PixelEditor, {PaletteColor} from '@cdo/apps/pixelEditor/PixelEditor';
import {PixelTool} from '@cdo/apps/pixelEditor/toolDefinitions';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import AnimatedSheetPreview from '../AnimatedSheetPreview';

import BehindTheScenes from './BehindTheScenes';
import {PixelReveal, PixelShuffle, SparkleBurst} from './PixelReveal';
import ResultActions, {Verdict, VerdictRow} from './ResultActions';
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
import WordMenus from './WordMenus';

import styles from './sentence-scene.module.scss';

const STYLES = Object.keys(IMAGE_STYLE_LABELS) as ImageStyle[];
// The service's middle temperature.
const TEMPERATURE = 1;

export type Mode = 'edit' | 'generating' | 'result' | 'paint';

const PAINT_TOOLS: readonly PixelTool[] = ['pen', 'bucket', 'eraser'];
const PAINT_COLORS: readonly PaletteColor[] = [
  {name: 'Black', rgba: [34, 34, 34, 255]},
  {name: 'Gray', rgba: [158, 158, 158, 255]},
  {name: 'White', rgba: [255, 255, 255, 255]},
  {name: 'Brown', rgba: [141, 85, 36, 255]},
  {name: 'Red', rgba: [229, 57, 53, 255]},
  {name: 'Orange', rgba: [251, 140, 0, 255]},
  {name: 'Yellow', rgba: [253, 216, 53, 255]},
  {name: 'Green', rgba: [67, 160, 71, 255]},
  {name: 'Teal', rgba: [0, 172, 193, 255]},
  {name: 'Blue', rgba: [30, 136, 229, 255]},
  {name: 'Purple', rgba: [142, 36, 170, 255]},
  {name: 'Pink', rgba: [236, 64, 122, 255]},
];

interface Made {
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
  /** The screen reader's status line. */
  status: React.ReactNode;
  /** The Type dropdown, when the host offers the choice. */
  typeChoice: React.ReactNode;
  /** The word menus, or the sentence read back while busy. */
  sentence: React.ReactNode;
  styleChoice: React.ReactNode;
  error: React.ReactNode;
  fact: React.ReactNode;
  /** The question and the thumbs, once there is a picture. */
  verdict: React.ReactNode;
  generate: () => void;
  changeWords: () => void;
  keep: () => void;
  /** The style and the kind the host's own paint entry would start from. */
  draft: {imageType: ImageType; style: ImageStyle};
}

interface SentenceSceneProps {
  imageType: ImageType;
  imageSubject?: ImageSubject;
  /** The sentence to build, by id; the image type's own when unset. */
  sentenceId?: string;
  /** Style the controls start on. */
  defaultStyle: ImageStyle;
  /** Recorded on the saved image. */
  imageRole?: string;
  uploadImage?: UploadImageFunction;
  /** The level's instructions, markdown, read at the top of the panel. */
  instructions?: string;
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
  /** Lay the parts out instead of the level's two halves. */
  layout?: (parts: SentenceSceneParts) => React.ReactNode;
}

const SentenceScene: React.FunctionComponent<SentenceSceneProps> = ({
  imageType: initialImageType,
  imageSubject: initialImageSubject,
  sentenceId,
  defaultStyle,
  imageRole,
  uploadImage,
  instructions,
  showTts,
  typeChoice,
  onKeep,
  onGenerateStart,
  method = 'scene',
  layout,
}) => {
  const dispatch = useAppDispatch();
  const {theme} = useTheme();
  const [style, setStyle] = useState<ImageStyle>(defaultStyle);
  const [kind, setKind] = useState(
    () => imageKindFor(initialImageType, initialImageSubject).value
  );
  const {imageType, subject: imageSubject} = typeChoice
    ? IMAGE_KINDS.find(k => k.value === kind) ?? IMAGE_KINDS[0]
    : {imageType: initialImageType, subject: initialImageSubject};
  const sentence = sentenceFor(imageType, imageSubject, sentenceId);
  const [choices, setChoices] = useState<Choices>({});
  const complete = isComplete(sentence, choices);
  // Every character is animated; an object or a background is one picture.
  const canAnimate = imageType === 'sprite' && imageSubject !== 'object';

  const [mode, setMode] = useState<Mode>('edit');
  const [made, setMade] = useState<Made | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fact, setFact] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  // The blank the student draws on, sized for the style.
  const [paintFrom, setPaintFrom] = useState<{
    dataURI: string;
    pixelGridSize?: number;
  } | null>(null);
  // Counts runs; a superseded run's result is dropped.
  const runRef = useRef(0);
  useEffect(() => () => void runRef.current++, []);

  const generate = useCallback(async () => {
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
    setVerdict(null);
    setError(null);
    setFact(current =>
      pickFact(
        {animated: canAnimate, pixel: style === 'pixel'},
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
        canAnimate,
        bodyPlan
      );
      const result = canAnimate
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
      setMade({
        result,
        dataURI: bytesToDataURI(result.uint8Array, result.mediaType),
        prompt,
        sent,
      });
      setMode('result');
      playSound('reveal');
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
    canAnimate,
    method,
    onGenerateStart,
  ]);

  const keep = useCallback(async () => {
    if (!made) {
      return;
    }
    setSaving(true);
    try {
      if (onKeep) {
        await onKeep(made.result);
      } else {
        await saveGeneratedImage(dispatch, made.result, {
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
  }, [made, onKeep, dispatch, uploadImage, imageType, imageRole]);

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
      playSound(next === 'up' ? 'cheer' : 'hmm');
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_VERDICT,
        {
          verdict: next,
          promptText: made ? promptText(sentence, choices) : undefined,
          imageType,
        },
        true
      );
    },
    [made, sentence, choices, imageType]
  );

  const generating = mode === 'generating';
  const busy = generating || saving;
  const showingResult = mode === 'result' && !!made;

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

  const instructionsBlock = instructions && (
    <MainInstructionsContent
      instructionsText={instructions}
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
    made?.result.frames?.poses && made.result.frames
      ? {
          src: made.dataURI,
          frameSize: made.result.frames.frameSize,
          poses: made.result.frames.poses,
        }
      : null;

  if (mode === 'paint' && paintFrom) {
    return (
      <PixelEditor
        imageUrl={paintFrom.dataURI}
        knownPixelGrid={paintFrom.pixelGridSize}
        tools={PAINT_TOOLS}
        palette={PAINT_COLORS}
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
            frame={parts.canvas}
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
  const styleChoice = (
    <SimpleDropdown
      name="sentence-style"
      labelText="Style"
      isLabelVisible={false}
      size="s"
      color={theme === 'Dark' ? 'white' : 'black'}
      items={STYLES.map(s => ({value: s, text: IMAGE_STYLE_LABELS[s]}))}
      selectedValue={style}
      disabled={busy}
      onChange={e => setStyle(e.target.value as ImageStyle)}
    />
  );
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
      />
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
      <PixelShuffle />
    </div>
  ) : made ? (
    <>
      {sheet ? (
        <AnimatedSheetPreview {...sheet} />
      ) : (
        <img
          src={made.dataURI}
          alt={made.prompt}
          className={classNames(
            styles.preview,
            made.result.pixelGridSize && styles.pixelArt
          )}
        />
      )}
      {/* Keyed by picture, so each new one remounts and plays the reveal
          once. */}
      <PixelReveal
        key={`reveal-${made.result.filename}`}
        src={made.dataURI}
        crop={
          sheet
            ? {x: 0, y: 0, width: sheet.frameSize.x, height: sheet.frameSize.y}
            : undefined
        }
      />
      <SparkleBurst key={`burst-${made.result.filename}`} />
    </>
  ) : null;

  const underFrame = showingResult && made && (
    <BehindTheScenes sent={made.sent} disabled={busy} />
  );
  const verdictNode = showingResult && made && (
    <VerdictRow verdict={verdict} onJudge={judge} disabled={busy} />
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
          frameFilled: !!made && !generating,
          underFrame,
          status: statusNode,
          typeChoice: typeChoiceNode,
          sentence: sentenceNode,
          styleChoice,
          error: errorLine,
          fact: factNode,
          verdict: verdictNode,
          generate,
          changeWords,
          keep,
          draft: {imageType, style},
        })}
      </>
    );
  }

  return (
    <SentenceSceneLayout
      frameClassName={classNames(
        made && !generating && styles.imageFrameFilled
      )}
      frame={frame}
      underFrame={underFrame}
      frameAriaLabel="Your picture"
      panelAriaLabel="Make your picture"
      panelRef={panelRef}
      fillFrameHeight={!showingResult}
    >
      {statusNode}
      {instructionsBlock}
      {sentenceNode}
      {showingResult && made ? (
        <ResultActions
          verdict={verdict}
          onJudge={judge}
          onChangeWords={changeWords}
          onGenerateAgain={generate}
          onContinue={keep}
          disabled={busy}
        />
      ) : generating ? (
        // The status line above already reads this out.
        <div className={styles.generatingSpace}>
          <p className={styles.generatingLabel} aria-hidden>
            Generating…
          </p>
        </div>
      ) : (
        <div className={styles.generateRow}>
          {styleChoice}
          <MuiButton
            className={classNames(
              styles.generateButton,
              complete && !busy && styles.generateReady
            )}
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
            disabled={!complete || busy}
            onClick={generate}
          >
            Generate
          </MuiButton>
        </div>
      )}
      {errorLine}
      {factNode}
      {mode === 'edit' && (
        <div className={styles.bottomRow}>
          <hr className={styles.resultDivider} />
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
      )}
    </SentenceSceneLayout>
  );
};

export default SentenceScene;
