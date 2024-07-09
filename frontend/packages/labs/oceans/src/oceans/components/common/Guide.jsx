import React from 'react';
import Radium from 'radium';
import Typist from 'react-typist';

import {getState, setState} from '@ml/oceans/state';
import guide from '@ml/oceans/models/guide';
import soundLibrary from '@ml/oceans/models/soundLibrary';
import styles from '@ml/oceans/styles';
import colors from '@ml/oceans/styles/colors';
import I18n from '@ml/oceans/i18n';
import {Button} from '@ml/oceans/components/common';
import arrowDownImage from '@public/images/arrow-down.png';
import {
  startTextToSpeech,
  stopTextToSpeech,
  hasTextToSpeechVoices
} from '@ml/utils/TextToSpeech';

export const stopTypingSounds = () => {
  const state = getState();
  if (state.guideTypingTimer) {
    clearInterval(state.guideTypingTimer);
    setState({guideTypingTimer: undefined}, {skipCallback: true});
  }
};

let UnwrappedGuide = class Guide extends React.Component {
  onTypingDone() {
    clearInterval(getState().guideTypingTimer);
    setState({guideShowing: true, guideTypingTimer: undefined});
  }

  onGuideClick = () => {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    if (this.updateTextToSpeech(true)) {
      // This click started text to speech.
      setState(
        {
          hasTextToSpeechStartedByClick: true,
          textToSpeechCurrentGuide: currentGuide
        },
        {skipCallback: true}
      );
    } else {
      // This click did not start text to speech, so attempt
      // to dismiss the guide.
      const dismissed = guide.dismissCurrentGuide();
      if (dismissed) {
        if (state.textToSpeechLocale) {
          stopTextToSpeech();
        }
        soundLibrary.playSound('other');
      }
    }
  };

  // Called from both the guide click handler and the render method, and
  // attempts to play text to speech if needed.  Returns true if it believes
  // it started text to speech.
  updateTextToSpeech = inClickHandler => {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    // Do nothing if text to speech is not desired or yet available.
    if (!state.textToSpeechLocale || !hasTextToSpeechVoices()) {
      return false;
    }

    // Do nothing if there is no current guide, or if we've already started
    // text to speech for the current guide (which might have finished
    // playing by now).
    if (
      !currentGuide ||
      state.textToSpeechCurrentGuide === currentGuide
    ) {
      return false;
    }

    // If we are in a click handler, do nothing if we've already started
    // text to speech from a click handler.
    // If we are not in a click handler, do nothing if we've never started
    // from a click handler before.
    if (inClickHandler === state.hasTextToSpeechStartedByClick) {
      return false;
    }

    // Make an attempt to play text to speech, and return whether we
    // believe it has started.
    return startTextToSpeech(
      currentGuide.textFn(getState()),
      state.textToSpeechLocale
    );
  };

  render() {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    let guideBgStyle = [styles.guideBackground];
    if (currentGuide) {
      if (currentGuide.noDimBackground) {
        guideBgStyle = [styles.guideBackgroundHidden];
      }

      // Info guides should have a darker background color.
      if (currentGuide.style === 'Info') {
        guideBgStyle.push({backgroundColor: colors.transparentBlack});
      }
    }

    // Start playing the typing sounds.
    if (
      !state.textToSpeechLocale &&
      !state.guideShowing &&
      !state.guideTypingTimer &&
      currentGuide
    ) {
      const guideTypingTimer = setInterval(() => {
        soundLibrary.playSound('no', 0.5);
      }, 1000 / 10);
      setState({guideTypingTimer}, {skipCallback: true});
    }

    if (this.updateTextToSpeech(false)) {
      // This call started text to speech.
      setState({textToSpeechCurrentGuide: currentGuide}, {skipCallback: true});
    }

    return (
      <div>
        {currentGuide && currentGuide.image && (
          <img
            src={currentGuide.image}
            style={[styles.guideImage, currentGuide.imageStyle || {}]}
            alt=""
          />
        )}
        {!!currentGuide && (
          <div>
            <div
              key={currentGuide.id}
              style={guideBgStyle}
              onClick={this.onGuideClick}
              id="uitest-dismiss-guide"
            >
              <div
                style={{
                  ...styles.guide,
                  ...styles[`guide${currentGuide.style}`]
                }}
              >
                <div>
                  {currentGuide.style === 'Info' && (
                    <div style={styles.guideHeading}>
                      {I18n.t('didYouKnow')}
                    </div>
                  )}

                  <div style={styles.guideTypingText}>
                    <Typist
                      avgTypingDelay={35}
                      stdTypingDelay={15}
                      cursor={{show: false}}
                      onTypingDone={this.onTypingDone}
                    >
                      {currentGuide.textFn(getState())}
                    </Typist>
                  </div>

                  <div
                    style={
                      currentGuide.style === 'Info'
                        ? styles.guideFinalTextInfoContainer
                        : styles.guideFinalTextContainer
                    }
                  >
                    <div style={styles.guideFinalText}>
                      {currentGuide.textFn(getState())}
                    </div>
                  </div>
                  {currentGuide.style === 'Info' && (
                    <Button style={styles.infoGuideButton} onClick={() => {}}>
                      {I18n.t('continue')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {currentGuide.arrow && (
              <img
                src={arrowDownImage}
                style={{
                  ...styles.guideArrow,
                  ...styles[`arrow${currentGuide.arrow}`]
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  }
};
export default Radium(UnwrappedGuide);
