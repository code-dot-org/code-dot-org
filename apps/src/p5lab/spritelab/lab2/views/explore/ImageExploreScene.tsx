// An image level laid out as two halves: the picture on the left, the
// controls on the right. Reached by level_mode.imageUi or ?image-ui=explore.

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
  CachedImage,
  findCachedImage,
  ImageCacheMissError,
  ImageSource,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  GeneratedImageResult,
  generateImage,
  GenerateImageOptions,
  UploadImageFunction,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {ImageSafetyError} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageSafety';
import {defaultPixelGrid} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {
  IMAGE_STYLE_LABELS,
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
import {pickFact} from './exploreFacts';
import ExploreLayout from './ExploreLayout';
import {
  Choices,
  chosenBodyPlan,
  isComplete,
  promptText,
  sentenceFor,
  sentenceWordIds,
} from './exploreSentences';
import {playSound} from './exploreSounds';
import {PixelReveal, PixelShuffle, SparkleBurst} from './PixelReveal';
import ResultActions, {Verdict} from './ResultActions';
import {saveGeneratedImage, savePaintedImage} from './saveGeneratedImage';
import SentenceReadOnly from './SentenceReadOnly';
import {SentPrompts, sentPromptsFor} from './sentPrompts';
import WordMenus from './WordMenus';

import styles from './image-explore.module.scss';

const STYLES = Object.keys(IMAGE_STYLE_LABELS) as ImageStyle[];
// The service's middle temperature.
const TEMPERATURE = 1;

type Mode = 'edit' | 'generating' | 'result' | 'paint';

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

interface ImageExploreSceneProps {
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
  /** Where a sentence's picture comes from: the model, the cache, or the
      cache with the model behind it (imageCache.ts). The model when unset. */
  imageSource?: ImageSource;
  /** Another tree to read cached pictures from (QA). */
  imageCacheUrl?: string;
}

const ImageExploreScene: React.FunctionComponent<ImageExploreSceneProps> = ({
  imageType,
  imageSubject,
  sentenceId,
  defaultStyle,
  imageRole,
  uploadImage,
  instructions,
  showTts,
  imageSource = 'live',
  imageCacheUrl,
}) => {
  const dispatch = useAppDispatch();
  const {theme} = useTheme();
  const [style, setStyle] = useState<ImageStyle>(defaultStyle);
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
  // The cached variant shown last, so Generate again shows another.
  const lastCachedVariantRef = useRef<number>();

  // The cached picture for the sentence as filled, when the level reads
  // from the cache and it has one of the right style and form.
  const findCached = useCallback(async (): Promise<CachedImage | undefined> => {
    if (imageSource === 'live') {
      return undefined;
    }
    const cached = await findCachedImage({
      sentenceId: sentence.id,
      wordIds: sentenceWordIds(sentence, choices),
      style,
      avoidVariant: lastCachedVariantRef.current,
      baseUrl: imageCacheUrl,
    });
    // A set's base frame serves as a single picture; a single picture
    // cannot become a set.
    return canAnimate && cached && !cached.characterSet ? undefined : cached;
  }, [imageSource, sentence, choices, style, imageCacheUrl, canAnimate]);

  const generate = useCallback(async () => {
    const run = ++runRef.current;
    const prompt = promptText(sentence, choices);
    // A live level never waits here: the generating state shows at once.
    const cached = imageSource === 'live' ? undefined : await findCached();
    if (run !== runRef.current) {
      return;
    }
    if (!cached && imageSource === 'cached') {
      setError("This picture isn't ready yet. Try different words.");
      return;
    }
    // true attaches the project context for per-level breakdowns.
    analyticsReporter.sendEvent(
      EVENTS.HOAI2026_IMAGE_PROMPT,
      {
        promptText: prompt,
        method: 'explore',
        imageType,
        sentenceId: sentence.id,
        choices,
        style,
        imageSource,
        cached: !!cached,
      },
      true
    );
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
      // What the lab would send. A cached picture was made from the same
      // words by the same prompt builders, so this describes it as well.
      const sent: SentPrompts = sentPromptsFor(
        prompt,
        options,
        style,
        canAnimate,
        bodyPlan
      );
      const draw = (source?: CachedImage) =>
        canAnimate
          ? generateCharacterSet(prompt, {
              style,
              temperature: TEMPERATURE,
              pixelGrid: options.pixelGrid,
              bodyPlan,
              cached: source,
            })
          : generateImage(prompt, {...options, cached: source});
      let result: GeneratedImageResult;
      try {
        result = await draw(cached);
      } catch (e) {
        // The manifest promised a file the tree lacks: the model covers it
        // where the level allows.
        if (
          cached &&
          e instanceof ImageCacheMissError &&
          imageSource === 'cached-then-live'
        ) {
          console.warn(e.message);
          result = await draw();
        } else {
          throw e;
        }
      }
      if (run !== runRef.current) {
        return;
      }
      if (cached) {
        lastCachedVariantRef.current = cached.variant;
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
    findCached,
    imageSource,
  ]);

  const keep = useCallback(async () => {
    if (!made) {
      return;
    }
    setSaving(true);
    try {
      await saveGeneratedImage(dispatch, made.result, {
        uploadImage,
        imageType,
        imageRole,
      });
      dispatch(continueOrFinishLesson());
    } catch (e) {
      console.error('Saving the image failed:', e);
      setError("Couldn't save the picture. Try again.");
    } finally {
      // On the last level with no finish URL, the lesson does not move on.
      setSaving(false);
    }
  }, [made, dispatch, uploadImage, imageType, imageRole]);

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
          <ExploreLayout
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
          </ExploreLayout>
        )}
      </PixelEditor>
    );
  }

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

  return (
    <ExploreLayout
      frameClassName={classNames(
        made && !generating && styles.imageFrameFilled
      )}
      frame={frame}
      underFrame={
        showingResult &&
        made && <BehindTheScenes sent={made.sent} disabled={busy} />
      }
      frameAriaLabel="Your picture"
      panelAriaLabel="Make your picture"
      panelRef={panelRef}
      fillFrameHeight={!showingResult}
    >
      <div className={styles.srOnly} role="status">
        {status}
      </div>
      {instructionsBlock}
      {showingResult || generating ? (
        <SentenceReadOnly sentence={sentence} choices={choices} />
      ) : (
        <WordMenus
          sentence={sentence}
          choices={choices}
          onChange={setChoices}
          disabled={busy}
        />
      )}
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
          <SimpleDropdown
            name="explore-style"
            labelText="Style"
            isLabelVisible={false}
            size="s"
            color={theme === 'Dark' ? 'white' : 'black'}
            items={STYLES.map(s => ({value: s, text: IMAGE_STYLE_LABELS[s]}))}
            selectedValue={style}
            onChange={e => setStyle(e.target.value as ImageStyle)}
          />
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
      {generating && fact && (
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
      )}
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
    </ExploreLayout>
  );
};

export default ImageExploreScene;
