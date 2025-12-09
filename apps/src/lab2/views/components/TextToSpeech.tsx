import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useEffect, useState, MutableRefObject} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';
import {useLocalization} from '@cdo/apps/localization';
import {useBrowserTextToSpeech} from '@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper';
import i18n from '@cdo/locale';

import moduleStyles from './TextToSpeech.module.scss';

interface TextToSpeechProps {
  /** The exact text to read aloud. */
  text?: string;
  /** A Ref capturing the live content to read aloud. */
  contentRef?: MutableRefObject<HTMLElement | null>;
}

const usePause = queryParams('tts-play-pause') === 'true';
const playIcon = (queryParams('tts-play-icon') as string) || 'volume';
const stopIcon = (queryParams('tts-stop-icon') as string) || 'circle-stop';
// If the list of enabled locales is set to true, enable all locales.
const enabledLocales = DCDO.get('browser-tts-button-enabled-locales', []) as
  | string[]
  | boolean;

/**
 * TextToSpeech play button.
 *
 * This takes either some specific `text` content or a reference to a given
 * element to derive that text from using the `textContent` property.
 *
 * The button is not rendered if the text-to-speech engine is not available
 * or the current locale is not enabled via the array provided by the
 * `browser-tts-button-enabled-locales` DCDO flag.
 */
const TextToSpeech: React.FunctionComponent<TextToSpeechProps> = ({
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
    setTtsButtonEnabled(
      enabledLocales === true ||
        (Array.isArray(enabledLocales) && enabledLocales.includes(locale))
    );
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
        isPlaying && moduleStyles.playButtonPlaying
      )}
      onClick={playText}
      onKeyDown={handleKeyDown}
      aria-label={i18n.playTextToSpeech()}
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
