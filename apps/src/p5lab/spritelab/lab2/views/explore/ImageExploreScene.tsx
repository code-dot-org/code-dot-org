// An image level laid out as two halves: the image on the left, the editing
// controls on the right. An exploration beside GenerateImagePane, reached
// by level_mode.imageUi or ?image-ui=explore; the pane is untouched.

import Checkbox from '@code-dot-org/component-library/checkbox';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Popover from '@code-dot-org/component-library/popover';
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
import PixelEditor, {PaletteColor} from '@cdo/apps/pixelEditor/PixelEditor';
import {PixelTool} from '@cdo/apps/pixelEditor/toolDefinitions';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  basePrompt,
  generateCharacterSet,
  posedFrames,
  posePrompt,
} from '../../ai/images/characterSet';
import {bytesToDataURI} from '../../ai/images/encoding';
import {
  fullPromptFor,
  GeneratedImageResult,
  generateImage,
  GenerateImageOptions,
  pixelBlockFor,
  UploadImageFunction,
} from '../../ai/images/imageGeneration';
import {ImageSafetyError} from '../../ai/images/imageSafety';
import {chooseKeyColor} from '../../ai/images/keyColor';
import {defaultPixelGrid} from '../../ai/images/modelHelpers';
import {
  IMAGE_STYLE_LABELS,
  ImageStyle,
  ImageSubject,
  ImageType,
} from '../../ai/images/types';
import {BACKGROUND_GROUND_COLOR, blankPaintImage} from '../../paintBlank';
import AnimatedSheetPreview from '../AnimatedSheetPreview';

import {pickFact} from './exploreFacts';
import {
  Choices,
  chosenBodyPlan,
  isComplete,
  promptText,
  sentenceFor,
} from './exploreSentences';
import {saveGeneratedImage, savePaintedImage} from './saveGeneratedImage';
import SentenceBuilder from './SentenceBuilder';
import SentenceReadOnly from './SentenceReadOnly';
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
// Eight plain colours, one swatch each, in place of the spectrum picker.
const PAINT_COLORS: readonly PaletteColor[] = [
  {name: 'Black', rgba: [34, 34, 34, 255]},
  {name: 'White', rgba: [255, 255, 255, 255]},
  {name: 'Red', rgba: [229, 57, 53, 255]},
  {name: 'Orange', rgba: [251, 140, 0, 255]},
  {name: 'Yellow', rgba: [253, 216, 53, 255]},
  {name: 'Green', rgba: [67, 160, 71, 255]},
  {name: 'Blue', rgba: [30, 136, 229, 255]},
  {name: 'Purple', rgba: [142, 36, 170, 255]},
];

// Stands in for the pose in the words every posed frame shares.
const POSE_MARK = '[pose]';

interface SentPrompts {
  /** The words for the one picture, or for a set's first picture. */
  picture: string;
  /** For a set: the words every posed frame got, with POSE_MARK where its
      pose goes, and each frame's pose. */
  poses?: {common: string; frames: {label: string; pose: string}[]};
}

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
  /** How the sentence is built: word slots in the sentence, or a prose
      sentence over word menus. */
  sentenceUi?: 'slots' | 'menu';
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
  sentenceUi = 'slots',
  instructions,
  showTts,
}) => {
  const dispatch = useAppDispatch();
  const {theme} = useTheme();
  const [style, setStyle] = useState<ImageStyle>(defaultStyle);
  // The menu variant animates every character and offers no choice.
  const offersAnimation = sentenceUi === 'slots';
  const [animated, setAnimated] = useState(!offersAnimation);
  const sentence = sentenceFor(imageType, imageSubject);
  const [choices, setChoices] = useState<Choices>({});
  const complete = isComplete(sentence, choices);
  // Only a character can be animated; an object or a background is one
  // picture.
  const canAnimate = imageType === 'sprite' && imageSubject !== 'object';

  const [mode, setMode] = useState<Mode>('edit');
  const [made, setMade] = useState<Made | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fact, setFact] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptTab, setPromptTab] = useState<'picture' | 'poses'>('picture');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  // The blank the student draws on, sized for the style, and the mode to
  // return to if they cancel.
  const [paintFrom, setPaintFrom] = useState<{
    dataURI: string;
    pixelGridSize?: number;
  } | null>(null);
  const paintReturnRef = useRef<Mode>('edit');
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const promptRowRef = useRef<HTMLDivElement>(null);
  // The prompt panel opens above the link under the frame, capped so it
  // never covers the whole picture: the words inside scroll instead.
  const [promptRoom, setPromptRoom] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!showPrompt) {
      return;
    }
    const measure = () => {
      const row = promptRowRef.current;
      if (row) {
        setPromptRoom(
          Math.min(420, Math.max(200, row.getBoundingClientRect().top - 16))
        );
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPrompt(false);
        infoButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', measure);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showPrompt]);
  // Counts runs; a superseded run's result is dropped.
  const runRef = useRef(0);
  useEffect(() => () => void runRef.current++, []);

  const generate = useCallback(async () => {
    const run = ++runRef.current;
    const prompt = promptText(sentence, choices);
    setMode('generating');
    setShowPrompt(false);
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
      const asSet = animated && canAnimate;
      // What "Behind the scenes" shows: a set's first frame is asked for
      // in its own words, and every posed frame then gets the same words
      // around its pose.
      let sent: SentPrompts;
      if (asSet) {
        const key = chooseKeyColor(prompt);
        const block = pixelBlockFor('sprite', options.pixelGrid);
        sent = {
          picture: basePrompt(prompt, style, key, block, bodyPlan),
          poses: {
            common: posePrompt(
              prompt,
              {label: 'pose', pose: POSE_MARK},
              style,
              key,
              block
            ),
            frames: posedFrames(bodyPlan).map(({label, pose}) => ({
              label,
              pose,
            })),
          },
        };
      } else {
        sent = {picture: fullPromptFor(prompt, options)};
      }
      const result = asSet
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
  }, [sentence, choices, imageType, imageSubject, style, animated, canAnimate]);

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
    setShowPrompt(false);
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
    setShowPrompt(false);
    setMode('edit');
  }, []);

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
            <div
              className={styles.underFrame}
              ref={promptRowRef}
              style={
                promptRoom === null
                  ? undefined
                  : ({
                      '--prompt-room': `${promptRoom}px`,
                    } as React.CSSProperties)
              }
            >
              <button
                type="button"
                ref={infoButtonRef}
                className={styles.promptLink}
                aria-expanded={showPrompt}
                disabled={busy}
                onClick={() => {
                  setPromptTab('picture');
                  setShowPrompt(open => !open);
                }}
              >
                <FontAwesomeV6Icon iconName="circle-info" />
                Behind the scenes
              </button>
              {showPrompt && (
                <Popover
                  direction="none"
                  title="Behind the scenes"
                  content="We sent the AI these words. It predicted a picture to match them."
                  className={styles.promptPopover}
                  onClose={() => setShowPrompt(false)}
                >
                  {made.sent.poses && (
                    <div
                      className={styles.promptTabs}
                      role="tablist"
                      aria-label="Which words"
                    >
                      {(
                        [
                          ['picture', 'First picture'],
                          ['poses', 'Other poses'],
                        ] as const
                      ).map(([tab, label]) => (
                        <button
                          key={tab}
                          type="button"
                          role="tab"
                          aria-selected={promptTab === tab}
                          className={styles.promptTab}
                          onClick={() => setPromptTab(tab)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {made.sent.poses && promptTab === 'poses' ? (
                    <>
                      <p className={styles.promptNote}>
                        Then, for each pose, we sent the first picture back with
                        these words. Only the part in brackets changed.
                      </p>
                      <div className={styles.promptText} role="tabpanel">
                        <p className={styles.promptCommon}>
                          {made.sent.poses.common
                            .split(POSE_MARK)
                            .flatMap((piece, i) =>
                              i === 0
                                ? [piece]
                                : [
                                    <mark key={i} className={styles.poseMark}>
                                      {POSE_MARK}
                                    </mark>,
                                    piece,
                                  ]
                            )}
                        </p>
                        <ul className={styles.poseList}>
                          {made.sent.poses.frames.map(frame => (
                            <li key={frame.label}>
                              <span className={styles.poseLabel}>
                                {frame.label}:
                              </span>{' '}
                              {frame.pose}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className={styles.promptText} role="tabpanel">
                      {made.sent.picture}
                    </p>
                  )}
                </Popover>
              )}
            </div>
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
            ) : sentenceUi === 'menu' ? (
              <WordMenus
                sentence={sentence}
                choices={choices}
                onChange={setChoices}
                disabled={busy}
              />
            ) : (
              <SentenceBuilder
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
                      onClick={() => setVerdict('up')}
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
                      onClick={() => setVerdict('down')}
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
                {canAnimate && offersAnimation && (
                  <Checkbox
                    name="explore-animated"
                    label="Make it move"
                    size="s"
                    checked={animated}
                    disabled={busy}
                    onChange={e => setAnimated(e.target.checked)}
                  />
                )}
                {/* Hidden, not greyed, while a picture is made. */}
                {!generating && (
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
                )}
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
