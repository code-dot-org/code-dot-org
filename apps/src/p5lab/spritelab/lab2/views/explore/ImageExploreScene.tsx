// An image level laid out as two halves: the image on the left, the editing
// controls on the right. An exploration beside GenerateImagePane, reached
// by level_mode.imageUi or ?image-ui=explore; the pane is untouched.

import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Popover from '@code-dot-org/component-library/popover';
import RadioButton from '@code-dot-org/component-library/radioButton';
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
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import aiBotGenerating0 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-0.png';
import aiBotGenerating1 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-1.png';
import aiBotGenerating2 from '@cdo/static/spritelab_lab2/ai-bot/ai-bot-generating-2.png';
import pixelSample from '@cdo/static/spritelab_lab2/style/pixel.png';
import smoothSample from '@cdo/static/spritelab_lab2/style/smooth.png';

import {
  basePrompt,
  CharacterSetProgress,
  generateCharacterSet,
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
import AnimatedSheetPreview from '../AnimatedSheetPreview';

import {pickFact} from './exploreFacts';
import {
  Choices,
  chosenBodyPlan,
  isComplete,
  promptText,
  sentenceFor,
} from './exploreSentences';
import {saveGeneratedImage} from './saveGeneratedImage';
import SentenceBuilder from './SentenceBuilder';
import WordMenus from './WordMenus';

import styles from './image-explore.module.scss';

const STYLES: ImageStyle[] = ['pixel', 'smooth'];
const BOT_FRAMES = [aiBotGenerating0, aiBotGenerating1, aiBotGenerating2];
// The service's middle temperature, what the student form sends.
const TEMPERATURE = 1;

type Mode = 'edit' | 'generating' | 'result';

interface Made {
  result: GeneratedImageResult;
  dataURI: string;
  /** The words as the model got them, for the (i) button. */
  sentPrompt: string;
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
}

const ImageExploreScene: React.FunctionComponent<ImageExploreSceneProps> = ({
  imageType,
  imageSubject,
  defaultStyle,
  imageRole,
  uploadImage,
  sentenceUi = 'slots',
}) => {
  const dispatch = useAppDispatch();
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
  const [progress, setProgress] = useState<CharacterSetProgress | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const resultBarRef = useRef<HTMLDivElement>(null);
  // Half the height free above the result bar: the prompt panel never has
  // to flip below the button that opened it, and a shorter panel that
  // scrolls reads as less of a wall of text than one that fills the column.
  const [promptRoom, setPromptRoom] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!showPrompt) {
      return;
    }
    const measure = () => {
      const bar = resultBarRef.current;
      if (bar) {
        setPromptRoom(
          Math.max(160, (bar.getBoundingClientRect().top - 16) / 2)
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
  // Counts runs; a superseded run's progress and result are dropped.
  const runRef = useRef(0);
  useEffect(() => () => void runRef.current++, []);

  // The bot's frames cycle while a request is out.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (mode !== 'generating') {
      return;
    }
    const timer = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(timer);
  }, [mode]);

  const generate = useCallback(async () => {
    const run = ++runRef.current;
    const prompt = promptText(sentence, choices);
    setMode('generating');
    setShowPrompt(false);
    setError(null);
    setProgress(null);
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
      // A set's first frame is asked for in its own words; the (i) button
      // shows those, the posed frames being edits of that picture.
      const sentPrompt = asSet
        ? basePrompt(
            prompt,
            style,
            chooseKeyColor(prompt),
            pixelBlockFor('sprite', options.pixelGrid),
            bodyPlan
          )
        : fullPromptFor(prompt, options);
      const result = asSet
        ? await generateCharacterSet(
            prompt,
            {
              style,
              temperature: TEMPERATURE,
              pixelGrid: options.pixelGrid,
              bodyPlan,
            },
            p => {
              if (run === runRef.current) {
                setProgress(p);
              }
            }
          )
        : await generateImage(prompt, options);
      if (run !== runRef.current) {
        return;
      }
      setMade({
        result,
        dataURI: bytesToDataURI(result.uint8Array, result.mediaType),
        sentPrompt,
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

  const generating = mode === 'generating';
  const busy = generating || saving;
  const sheet =
    made?.result.frames?.poses && made.result.frames
      ? {
          src: made.dataURI,
          frameSize: made.result.frames.frameSize,
          poses: made.result.frames.poses,
        }
      : null;

  return (
    <div className={styles.scene}>
      <section className={styles.imagePane} aria-label="Your image">
        <div
          className={classNames(
            styles.imageFrame,
            made && !generating && styles.imageFrameFilled
          )}
        >
          {generating ? (
            <div className={styles.generating} role="status">
              {progress?.preview ? (
                <img
                  src={progress.preview}
                  alt=""
                  className={classNames(
                    styles.preview,
                    style === 'pixel' && styles.pixelArt
                  )}
                />
              ) : (
                <img
                  src={BOT_FRAMES[tick % BOT_FRAMES.length]}
                  alt=""
                  className={styles.bot}
                />
              )}
              <div className={styles.spinnerRow}>
                <CircularProgress size={48} thickness={5} />
                <MuiTypography variant="body1">
                  {progress
                    ? `Drawing ${progress.label}… (${progress.done} of ${progress.total})`
                    : 'Making your picture…'}
                </MuiTypography>
              </div>
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
        {mode === 'result' && made && (
          <div
            className={styles.resultBar}
            ref={resultBarRef}
            style={
              promptRoom === null
                ? undefined
                : ({'--prompt-room': `${promptRoom}px`} as React.CSSProperties)
            }
          >
            <MuiIconButton
              ref={infoButtonRef}
              className={styles.infoButton}
              aria-label="What we asked the AI"
              aria-expanded={showPrompt}
              disabled={busy}
              onClick={() => setShowPrompt(open => !open)}
            >
              <FontAwesomeV6Icon iconName="circle-info" />
            </MuiIconButton>
            {showPrompt && (
              <Popover
                direction="none"
                title="What we asked the AI"
                content={made.sentPrompt}
                className={styles.promptPopover}
                onClose={() => setShowPrompt(false)}
              />
            )}
            <MuiButton
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<FontAwesomeV6Icon iconName="thumbs-down" />}
              disabled={busy}
              onClick={generate}
            >
              Try again
            </MuiButton>
            <MuiButton
              variant="contained"
              color="primary"
              size="large"
              startIcon={<FontAwesomeV6Icon iconName="thumbs-up" />}
              disabled={busy}
              onClick={keep}
            >
              Keep it
            </MuiButton>
          </div>
        )}
      </section>
      <section className={styles.editPane} aria-label="Make your image">
        <div className={styles.group}>
          <fieldset className={styles.styleChoice} disabled={busy}>
            <legend className={styles.srOnly}>Style</legend>
            <div className={styles.styleOptions}>
              {STYLES.map(s => (
                <RadioButton
                  key={s}
                  name="explore-style"
                  value={s}
                  size="s"
                  checked={style === s}
                  onChange={() => setStyle(s)}
                  className={styles.styleOption}
                >
                  <img
                    src={s === 'pixel' ? pixelSample : smoothSample}
                    alt=""
                    className={classNames(
                      styles.styleSwatch,
                      s === 'pixel' && styles.pixelArt
                    )}
                  />
                  <MuiTypography variant="body3" component="span">
                    {IMAGE_STYLE_LABELS[s]}
                  </MuiTypography>
                </RadioButton>
              ))}
            </div>
          </fieldset>
          {sentenceUi === 'menu' ? (
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
            <MuiButton
              variant="contained"
              color="primary"
              disabled={!complete || busy}
              onClick={generate}
            >
              {mode === 'result' ? 'Generate again' : 'Generate'}
            </MuiButton>
          </div>
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
        </div>
        <div className={styles.group}>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="large"
            className={styles.drawButton}
            disabled
          >
            I'll draw it myself
          </MuiButton>
        </div>
      </section>
    </div>
  );
};

export default ImageExploreScene;
