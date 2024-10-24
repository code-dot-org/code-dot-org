import classNames from 'classnames';
import React, {useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {useBrowserTextToSpeech} from '@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper';

import moduleStyles from './TextToSpeech.module.scss';

interface TextToSpeechProps {
  text: string;
}

const usePause = queryParams('tts-play-pause') === 'true';

/**
 * TextToSpeech play button.
 */
const TextToSpeech: React.FunctionComponent<TextToSpeechProps> = ({text}) => {
  const {isTtsAvailable, speak, cancel, pause, resume} =
    useBrowserTextToSpeech();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  if (!isTtsAvailable) {
    return null;
  }

  return (
    <button
      className={classNames(
        moduleStyles.playButton,
        isPlaying && moduleStyles.playing
      )}
      onClick={playText}
      type="button"
    >
      <FontAwesomeV6Icon
        iconName={'waveform-lines'}
        iconStyle="regular"
        className={moduleStyles.icon}
      />
    </button>
  );
};

export default TextToSpeech;
