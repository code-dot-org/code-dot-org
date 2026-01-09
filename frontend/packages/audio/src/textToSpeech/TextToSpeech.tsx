import classNames from 'classnames';
import React, {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useLocalization} from '@code-dot-org/localization';

import {useBrowserTextToSpeech} from './BrowserTextToSpeechWrapper';

import moduleStyles from './textToSpeech.module.scss';

export interface TextToSpeechProps {
  text: string;
  higherPosition?: boolean;
}

const usePause: boolean = true;

/**
 * TextToSpeech play button.
 */
const TextToSpeech: React.FunctionComponent<TextToSpeechProps> = ({
  text,
  higherPosition,
}) => {
  const {isTtsAvailable, speak, cancel, pause, resume} =
    useBrowserTextToSpeech();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const locale = useLocalization();

  const ttsButtonEnabled = ['en'].includes(locale);
  console.log('TTS ENABLED?', ttsButtonEnabled);

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

    const utterance = speak(text);
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
        higherPosition && moduleStyles.playButtonHigherPosition,
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
