import IconButton from '@mui/material/IconButton';
import classNames from 'classnames';
import type {FunctionComponent, MutableRefObject} from 'react';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useLocalization} from '@code-dot-org/core/plugins/localization';

import {useBrowserTextToSpeech} from './BrowserTextToSpeechWrapper';

import moduleStyles from './textToSpeech.module.css';

export interface TextToSpeechProps {
  /** The specific text to speak */
  text?: string;
  /** A Ref capturing the live content to read aloud. */
  contentRef?: MutableRefObject<HTMLElement | null>;
  /**
   * Locales the button is offered in, or `true` for every locale.
   *
   * Browser speech synthesis varies in quality by language, so the set is
   * deliberately narrow. It is a prop rather than a constant because which
   * locales are worth offering is the host's call, not this package's: in
   * dashboard it comes from the `browser-tts-button-enabled-locales` DCDO
   * flag, which lets it be changed without a deploy.
   */
  enabledLocales?: string[] | true;
}

// When false, a second press stops playback (cancel) and resets to the play
// state immediately, rather than pausing. Matches the legacy default; browser
// `pause()` is unreliable (e.g. Chrome delays/ignores it).
const usePause: boolean = false;

const DEFAULT_ENABLED_LOCALES = ['en', 'es', 'fr'];

/**
 * TextToSpeech play button.
 */
const TextToSpeech: FunctionComponent<TextToSpeechProps> = ({
  text,
  contentRef,
  enabledLocales = DEFAULT_ENABLED_LOCALES,
}) => {
  const {isTtsAvailable, speak, cancel, pause, resume} =
    useBrowserTextToSpeech();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const locale = useLocalization();

  // Derived from the locale, not stored: holding it in state and syncing it in
  // an effect costs a second render on every locale change and tells React the
  // value can disagree with `locale`, which it cannot.
  const ttsButtonEnabled =
    enabledLocales === true || enabledLocales.includes(locale);

  const playText = () => {
    if (!isTtsAvailable) {
      console.log('Browser TextToSpeech unavailable');
      return;
    }

    if (isPaused) {
      resume();
      setIsPaused(false);
      return;
    }

    if (isPlaying) {
      if (usePause) {
        pause();
        setIsPaused(true);
      } else {
        cancel();
      }
      return;
    }

    // Determine the text to speak by either using the 'text' override or the
    // text content for the provided content element.
    const spokenText: string = text || contentRef?.current?.textContent || '';

    const utterance = speak(spokenText);
    if (utterance) {
      utterance.addEventListener('start', () => setIsPlaying(true));
      utterance.addEventListener('end', () => {
        setIsPaused(false);
        setIsPlaying(false);
      });
      utterance.addEventListener('error', () => {
        setIsPaused(false);
        setIsPlaying(false);
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent onClick from firing twice
      event.stopPropagation();
      playText();
    }
  };

  if (!ttsButtonEnabled || !isTtsAvailable) {
    return null;
  }

  return (
    <IconButton
      className={classNames(
        moduleStyles.playButton,
        isPlaying && moduleStyles.playButtonPlaying,
      )}
      onClick={playText}
      onKeyDown={handleKeyDown}
      aria-label="Play text-to-speech"
      aria-pressed={isPlaying}
      // No padding — this is an inline affordance, not a standalone control.
      sx={{padding: 0}}
    >
      <FontAwesomeV6Icon
        iconName={isPlaying ? 'circle-stop' : 'volume'}
        iconStyle={'regular'}
        className={moduleStyles.icon}
      />
    </IconButton>
  );
};

export default TextToSpeech;
