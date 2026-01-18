import classNames from 'classnames';
import type {FunctionComponent, MutableRefObject} from 'react';
import {useState, useEffect} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useLocalization} from '@code-dot-org/core';

import {useBrowserTextToSpeech} from './BrowserTextToSpeechWrapper';

import moduleStyles from './textToSpeech.module.scss';

export interface TextToSpeechProps {
  /** The specific text to speak */
  text?: string;
  /** A Ref capturing the live content to read aloud. */
  contentRef?: MutableRefObject<HTMLElement | null>;
}

const usePause: boolean = true;

const enabledLocales = ['en', 'es', 'fr'];

/**
 * TextToSpeech play button.
 */
const TextToSpeech: FunctionComponent<TextToSpeechProps> = ({
  text,
  contentRef,
}) => {
  const {isTtsAvailable, speak, cancel, pause, resume} =
    useBrowserTextToSpeech();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [ttsButtonEnabled, setTtsButtonEnabled] = useState(false);

  const locale = useLocalization();

  // Determine, whenever the locale is set on the first time or updated, if the
  // text-to-speech engine is available for that locale.
  useEffect(() => {
    setTtsButtonEnabled(enabledLocales.includes(locale));
  }, [locale]);

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
    <button
      className={classNames(
        moduleStyles.playButton,
        isPlaying && moduleStyles.playButtonPlaying,
      )}
      onClick={playText}
      onKeyDown={handleKeyDown}
      aria-label="Play text-to-speech"
      type="button"
    >
      <FontAwesomeV6Icon
        iconName={isPlaying ? 'stop' : 'play'}
        iconStyle={'regular'}
        className={moduleStyles.icon}
      />
    </button>
  );
};

export default TextToSpeech;
