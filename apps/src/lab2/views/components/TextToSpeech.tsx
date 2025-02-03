import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';
import {useBrowserTextToSpeech} from '@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper';
import currentLocale from '@cdo/apps/util/currentLocale';

import moduleStyles from './TextToSpeech.module.scss';

interface TextToSpeechProps {
  text: string;
}

const usePause = queryParams('tts-play-pause') === 'true';
const playIcon = (queryParams('tts-play-icon') as string) || 'volume';
const stopIcon = (queryParams('tts-stop-icon') as string) || 'circle-stop';
// If the list of enabled locales is set to true, enable all locales.
const enabledLocales = DCDO.get('browser-tts-button-enabled-locales', []) as
  | string[]
  | boolean;
const ttsButtonEnabled =
  enabledLocales === true ||
  (Array.isArray(enabledLocales) && enabledLocales.includes(currentLocale()));

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

  if (!ttsButtonEnabled || !isTtsAvailable) {
    return null;
  }

  return (
    <button
      className={classNames(
        moduleStyles.playButton,
        isPlaying && moduleStyles.playButtonPlaying
      )}
      onClick={playText}
      type="button"
    >
      <FontAwesomeV6Icon
        iconName={isPlaying ? stopIcon : playIcon}
        iconStyle={'regular'}
        className={moduleStyles.icon}
      />
    </button>
  );
};

export default TextToSpeech;
