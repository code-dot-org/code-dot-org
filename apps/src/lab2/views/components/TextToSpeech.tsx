import {markdownToTxt} from 'markdown-to-txt';
import React, {useCallback} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {getCurrentLocale} from '@cdo/apps/lab2/projects/utils';

import moduleStyles from './TextToSpeech.module.scss';

interface TextToSpeechProps {
  text: string;
}

/**
 * TextToSpeech play button.
 */
const TextToSpeech: React.FunctionComponent<TextToSpeechProps> = ({text}) => {
  const playText = useCallback(() => {
    const currentLocale = getCurrentLocale();
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      return;
    }
    const voicesFiltered = voices.filter(voice => voice.lang === currentLocale);
    console.log(
      `TexttoSpeech: found ${voicesFiltered.length} of ${voices.length} possible voices`
    );
    if (voicesFiltered.length === 0) {
      return;
    }
    const voice = voicesFiltered[0];
    const plainText = markdownToTxt(text);
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.voice = voice;
    utterance.lang = currentLocale;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [text]);

  return (
    <div
      className={moduleStyles.playButton}
      onClick={playText}
      tabIndex={0}
      role="button"
    >
      <FontAwesomeV6Icon
        iconName={'play'}
        iconStyle="solid"
        className={moduleStyles.icon}
      />
    </div>
  );
};

export default TextToSpeech;
