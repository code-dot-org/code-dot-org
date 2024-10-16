import React, {useCallback} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {useBrowserTextToSpeech} from '@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper';

import moduleStyles from './TextToSpeech.module.scss';

interface TextToSpeechProps {
  text: string;
}

/**
 * TextToSpeech play button.
 */
const TextToSpeech: React.FunctionComponent<TextToSpeechProps> = ({text}) => {
  const {isTtsAvailable, speak} = useBrowserTextToSpeech();

  const playText = useCallback(() => {
    if (!isTtsAvailable) {
      console.log('Browser TextToSpeech unavailable');
      return;
    }
    speak(text);
  }, [isTtsAvailable, speak, text]);

  return (
    <button
      className={moduleStyles.playButton}
      onClick={playText}
      type="button"
      disabled={!isTtsAvailable} // TODO: Better UI for disabled state
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
