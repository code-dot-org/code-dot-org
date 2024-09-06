import {markdownToTxt} from 'markdown-to-txt';
import React, {useCallback} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from './TextToSpeech.module.scss';

interface TextToSpeechProps {
  text: string;
}

/**
 * TextToSpeech play button.
 */
const TextToSpeech: React.FunctionComponent<TextToSpeechProps> = ({text}) => {
  const playText = useCallback(() => {
    const plainText = markdownToTxt(text);
    const utterance = new SpeechSynthesisUtterance(plainText);
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
