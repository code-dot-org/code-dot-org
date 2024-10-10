import {markdownToTxt} from 'markdown-to-txt';
import React, {useCallback} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {getCurrentLocale} from '@cdo/apps/lab2/projects/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './TextToSpeech.module.scss';

interface TextToSpeechProps {
  text: string;
}

/**
 * TextToSpeech play button.
 */
const TextToSpeech: React.FunctionComponent<TextToSpeechProps> = ({text}) => {
  const textToSpeechHasVoices = useAppSelector(
    state => state.lab.textToSpeechHasVoices
  );

  const playText = useCallback(() => {
    const currentLocale = getCurrentLocale();
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('TextToSpeech: no voices available to play.');
      return;
    }
    const plainText = markdownToTxt(text);
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = currentLocale;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [text]);

  if (!textToSpeechHasVoices) {
    return null;
  }

  return (
    <button
      className={moduleStyles.playButton}
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
