// An image level laid out as two halves: the image on the left, the editing
// controls on the right. An exploration beside GenerateImagePane, reached
// by level_mode.imageUi or ?image-ui=explore; the pane is untouched.

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  CircularProgress,
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import Guide, {
  GUIDE_RIGHT_OFFSET_PX,
} from '@cdo/apps/lab2/views/components/guide/Guide';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import PixelEditor, {PaletteColor} from '@cdo/apps/pixelEditor/PixelEditor';
import {PixelTool} from '@cdo/apps/pixelEditor/toolDefinitions';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {generateCharacterSet} from '../../ai/images/characterSet';
import {bytesToDataURI} from '../../ai/images/encoding';
import {
  GeneratedImageResult,
  generateImage,
  GenerateImageOptions,
  UploadImageFunction,
} from '../../ai/images/imageGeneration';
import {ImageSafetyError} from '../../ai/images/imageSafety';
import {defaultPixelGrid} from '../../ai/images/modelHelpers';
import {
  IMAGE_STYLE_LABELS,
  ImageStyle,
  ImageSubject,
  ImageType,
} from '../../ai/images/types';
import {BACKGROUND_GROUND_COLOR, blankPaintImage} from '../../paintBlank';
import AnimatedSheetPreview from '../AnimatedSheetPreview';

import BehindTheScenes from './BehindTheScenes';
import {pickFact} from './exploreFacts';
import {
  Choices,
  chosenBodyPlan,
  isComplete,
  promptText,
  sentenceFor,
} from './exploreSentences';
import {saveGeneratedImage, savePaintedImage} from './saveGeneratedImage';
import SentenceReadOnly from './SentenceReadOnly';
import {SentPrompts, sentPromptsFor} from './sentPrompts';
import WordMenus from './WordMenus';

import styles from './image-explore.module.scss';

const STYLES: ImageStyle[] = ['pixel', 'smooth'];
// The service's middle temperature, what the student form sends.
const TEMPERATURE = 1;

type Mode = 'edit' | 'generating' | 'result' | 'paint';

// The reflection asked once a picture is back: a thumb each way.
type Verdict = 'up' | 'down';

// Drawing by hand offers the pen and the eraser; the rest of the editor's
// tools stay out of a first picture.
const PAINT_TOOLS: readonly PixelTool[] = ['pen', 'eraser'];
// The Guide's own padding (.guide in Guide.module.scss).
const GUIDE_PADDING_PX = 24;
// Twelve plain colors, one swatch each, in place of the spectrum picker.
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
  /** The words as the model got them, for "Behind the scenes". */
  sent: SentPrompts;
}

interface ImageExploreSceneProps {
  imageType: ImageType;
  imageSubject?: ImageSubject;
  /** Style the controls start on. */
  defaultStyle: ImageStyle;
  /** Recorded on the saved image. */
  imageRole?: string;
  uploadImage?: UploadImageFunction;
  /** The level's instructions, markdown, read at the top of the panel. */
  instructions?: string;
  /** Offer the read-aloud button on the instructions. */
  showTts?: boolean;
}

const ImageExploreScene: React.FunctionComponent<ImageExploreSceneProps> = ({
  imageType,
  imageSubject,
  defaultStyle,
  imageRole,
  uploadImage,
  instructions,
  showTts,
}) => {
  const dispatch = useAppDispatch();
  const {theme} = useTheme();
  const [style, setStyle] = useState<ImageStyle>(defaultStyle);
  const sentence = sentenceFor(imageType, imageSubject);
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
  // The blank the student draws on, sized for the style, and the mode to
  // return to if they cancel.
  const [paintFrom, setPaintFrom] = useState<{
    dataURI: string;
    pixelGridSize?: number;
  } | null>(null);
  const paintReturnRef = useRef<Mode>('edit');
  // Counts runs; a superseded run's result is dropped.
  const runRef = useRef(0);
  useEffect(() => () => void runRef.current++, []);

  const generate = useCallback(async () => {
    const run = ++runRef.current;
    const prompt = promptText(sentence, choices);
    // true attaches the project context (level path, app) for per-level
    // breakdowns, as the image dialog's event does.
    analyticsReporter.sendEvent(
      EVENTS.HOAI2026_IMAGE_PROMPT,
      {
        promptText: prompt,
        method: 'explore',
        imageType,
        sentenceId: sentence.id,
        choices,
        style,
      },
      true
    );
    setMode('generating');
    setVerdict(null);
    setError(null);
    setFact(current => pickFact(current ?? undefined));
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
        sent,
      });
      setMode('result');
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
  }, [sentence, choices, imageType, imageSubject, style, canAnimate]);

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
      setSaving(false);
    }
  }, [made, dispatch, uploadImage, imageType, imageRole]);

  const startPaint = useCallback(() => {
    paintReturnRef.current = mode;
    setError(null);
    setPaintFrom(blankPaintImage(imageType, style));
    setMode('paint');
  }, [mode, imageType, style]);

  const cancelPaint = useCallback(() => {
    setPaintFrom(null);
    setMode(paintReturnRef.current === 'result' && made ? 'result' : 'edit');
  }, [made]);

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

  // The thumb is the student's reflection; it goes to analytics with the
  // words it judged, and nowhere else.
  const judge = useCallback(
    (next: Verdict) => {
      setVerdict(next);
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

  // The Guide floats at a pixel width inside its half; the panel's body is
  // at least as tall as the frame, so its last row sits level with the
  // frame's bottom edge.
  const guideHostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [guideWidth, setGuideWidth] = useState<number | undefined>();
  const [frameHeight, setFrameHeight] = useState<number | undefined>();
  useLayoutEffect(() => {
    const host = guideHostRef.current;
    const frame = frameRef.current;
    if (!host || !frame || typeof ResizeObserver !== 'function') {
      return;
    }
    const measure = () => {
      setGuideWidth(Math.max(240, host.clientWidth - GUIDE_RIGHT_OFFSET_PX));
      setFrameHeight(frame.clientHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [mode]);

  const instructionsBlock = instructions && (
    <MainInstructionsContent
      instructionsText={instructions}
      markdownClassName={styles.instructions}
      showTts={showTts}
    />
  );
  // Only while a row is pushed to the floor (the draw button, or the
  // drawing's Cancel and Save); a result's panel is as tall as its content.
  const panelStyle =
    frameHeight === undefined || showingResult
      ? undefined
      : {minHeight: frameHeight - 2 * GUIDE_PADDING_PX};
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
        singleKeyShortcuts={false}
        fit="container"
        toolbarLayout="row"
        canvasClassName={styles.paintCanvas}
        opaqueGround={
          imageType === 'background' ? BACKGROUND_GROUND_COLOR : undefined
        }
        onSave={savePaint}
      >
        {parts => (
          <div className={styles.scene}>
            <section className={styles.imagePane} aria-label="Your drawing">
              <div className={styles.imageColumn}>
                <div
                  ref={frameRef}
                  className={classNames(styles.imageFrame, styles.paintFrame)}
                >
                  {parts.canvas}
                </div>
              </div>
            </section>
            <div ref={guideHostRef} className={styles.guideHost}>
              <Guide id="explore-guide" width={guideWidth}>
                <section
                  className={styles.panel}
                  style={panelStyle}
                  aria-label="Draw your image"
                >
                  {instructionsBlock}
                  {parts.toolbar}
                  {error && (
                    <MuiTypography
                      variant="body2"
                      className={styles.error}
                      role="alert"
                    >
                      {error}
                    </MuiTypography>
                  )}
                  <div
                    className={classNames(
                      styles.paintActions,
                      styles.bottomRow
                    )}
                  >
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
                </section>
              </Guide>
            </div>
          </div>
        )}
      </PixelEditor>
    );
  }

  return (
    <div className={styles.scene}>
      <section className={styles.imagePane} aria-label="Your image">
        <div className={styles.imageColumn}>
          <div
            ref={frameRef}
            className={classNames(
              styles.imageFrame,
              made && !generating && styles.imageFrameFilled
            )}
          >
            {generating ? (
              // Nothing of the picture shows until all of it is ready: a set's
              // frames arrive one by one, and the spinner alone covers that.
              <div
                className={styles.generating}
                role="status"
                aria-label="Making your picture"
              >
                <CircularProgress size={56} thickness={5} />
              </div>
            ) : made ? (
              sheet ? (
                <AnimatedSheetPreview {...sheet} />
              ) : (
                <img
                  src={made.dataURI}
                  alt={made.result.generation.prompt}
                  className={classNames(
                    styles.preview,
                    made.result.pixelGridSize && styles.pixelArt
                  )}
                />
              )
            ) : null}
          </div>
          {showingResult && made && (
            <BehindTheScenes sent={made.sent} disabled={busy} />
          )}
        </div>
      </section>
      <div ref={guideHostRef} className={styles.guideHost}>
        <Guide id="explore-guide" width={guideWidth}>
          <section
            className={styles.panel}
            style={panelStyle}
            aria-label="Make your image"
          >
            {instructionsBlock}
            {/* The words read back, with nothing to change, from the moment
              Generate is pressed until Change words. */}
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
              <>
                <hr className={styles.resultDivider} />
                <div
                  className={styles.resultActions}
                  role="group"
                  aria-labelledby="explore-result-label"
                >
                  <div className={styles.resultQuestionRow}>
                    <span
                      id="explore-result-label"
                      className={styles.resultQuestion}
                    >
                      How did the AI do?
                    </span>
                    <MuiIconButton
                      aria-label="Thumbs up"
                      aria-pressed={verdict === 'up'}
                      className={classNames(
                        styles.verdictButton,
                        verdict === 'up' && styles.verdictChosen
                      )}
                      disabled={busy}
                      onClick={() => judge('up')}
                    >
                      <FontAwesomeV6Icon iconName="thumbs-up" />
                    </MuiIconButton>
                    <MuiIconButton
                      aria-label="Thumbs down"
                      aria-pressed={verdict === 'down'}
                      className={classNames(
                        styles.verdictButton,
                        verdict === 'down' && styles.verdictChosen
                      )}
                      disabled={busy}
                      onClick={() => judge('down')}
                    >
                      <FontAwesomeV6Icon iconName="thumbs-down" />
                    </MuiIconButton>
                  </div>
                  <div className={styles.resultButtons}>
                    <MuiButton
                      variant="outlined"
                      color="secondary"
                      disabled={busy}
                      onClick={changeWords}
                    >
                      Change words
                    </MuiButton>
                    <MuiButton
                      variant="outlined"
                      color="secondary"
                      startIcon={<FontAwesomeV6Icon iconName="sparkles" />}
                      disabled={busy}
                      onClick={generate}
                    >
                      Generate again
                    </MuiButton>
                    <MuiButton
                      variant="contained"
                      color="primary"
                      disabled={busy}
                      onClick={keep}
                    >
                      Continue
                    </MuiButton>
                  </div>
                </div>
              </>
            ) : generating ? (
              // The frame's status region already tells assistive tech; this
              // is the sighted reader's word.
              <p className={styles.generatingLabel} aria-hidden>
                Generating…
              </p>
            ) : (
              <div className={styles.generateRow}>
                <SimpleDropdown
                  name="explore-style"
                  labelText="Style"
                  isLabelVisible={false}
                  size="s"
                  color={theme === 'Dark' ? 'white' : 'black'}
                  items={STYLES.map(s => ({
                    value: s,
                    text: IMAGE_STYLE_LABELS[s],
                  }))}
                  selectedValue={style}
                  onChange={e => setStyle(e.target.value as ImageStyle)}
                />
                <MuiButton
                  className={styles.generateButton}
                  variant="contained"
                  color="primary"
                  disabled={!complete || busy}
                  onClick={generate}
                >
                  Generate
                </MuiButton>
              </div>
            )}
            {error && (
              <MuiTypography
                variant="body2"
                className={styles.error}
                role="alert"
              >
                {error}
              </MuiTypography>
            )}
            {generating && fact && (
              <aside className={styles.factBox} aria-label="Did you know?">
                <FontAwesomeV6Icon
                  iconName="lightbulb"
                  className={styles.factIcon}
                />
                <MuiTypography variant="body2">{fact}</MuiTypography>
              </aside>
            )}
            {/* Offered while the words are being chosen, not once a picture is
              on its way or back. */}
            {mode === 'edit' && (
              <div className={styles.bottomRow}>
                <hr className={styles.resultDivider} />
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  className={styles.drawButton}
                  startIcon={<FontAwesomeV6Icon iconName="pen" />}
                  onClick={startPaint}
                >
                  I'll draw it myself
                </MuiButton>
              </div>
            )}
          </section>
        </Guide>
      </div>
    </div>
  );
};

export default ImageExploreScene;
