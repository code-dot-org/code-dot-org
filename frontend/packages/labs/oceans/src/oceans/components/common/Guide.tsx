import Radium from 'radium';
import React from 'react';
import Typist from 'react-typist';

import '@/oceans/styles/fade.css';

import {Button} from '@/oceans/components/common';
import I18n from '@/oceans/i18n';
import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';
import {getState, setState} from '@/oceans/state';
import styles from '@/oceans/styles';
import colors from '@/oceans/styles/colors';
const arrowDownImage = new URL(
  '../../../assets/images/arrow-down.png',
  import.meta.url,
).href;
import {
  startTextToSpeech,
  stopTextToSpeech,
  hasTextToSpeechVoices,
} from '@/utils/TextToSpeech';
const fingerClickIcon1 = new URL(
  '../../../assets/images/finger-click-icon-1.svg',
  import.meta.url,
).href;
const fingerClickIcon2 = new URL(
  '../../../assets/images/finger-click-icon-2.svg',
  import.meta.url,
).href;

export const stopTypingSounds = () => {
  const state = getState();
  if (state.guideTypingTimer) {
    clearInterval(state.guideTypingTimer as ReturnType<typeof setInterval>);
    setState({guideTypingTimer: undefined}, {skipCallback: true});
  }
};

interface GuideState {
  /** Tracks which guide ID was last focused to avoid re-focusing on re-render. */
  lastFocusedGuideId: string | null;
}

const UnwrappedGuide = class Guide extends React.Component<
  Record<string, never>,
  GuideState
> {
  guideDialogRef = React.createRef<HTMLDivElement>();
  lastFocusedGuideId: string | null = null;

  componentDidUpdate() {
    const currentGuide = guide.getCurrentGuide();
    const currentGuideId = currentGuide ? currentGuide.id : null;

    if (
      currentGuideId !== this.lastFocusedGuideId &&
      currentGuide &&
      this.guideDialogRef &&
      this.guideDialogRef.current
    ) {
      this.guideDialogRef.current.focus({preventScroll: false});
      this.lastFocusedGuideId = currentGuideId;
    } else if (!currentGuide) {
      this.lastFocusedGuideId = null;
    }
  }

  onTypingDone() {
    clearInterval(
      getState().guideTypingTimer as ReturnType<typeof setInterval>,
    );
    setState({guideShowing: true, guideTypingTimer: undefined});
  }

  onGuideKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
      e.preventDefault();
      this.onGuideClick();
    }
  };

  onGuideClick = () => {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    if (this.attemptTextToSpeech(true)) {
      setState(
        {
          hasTextToSpeechStartedByClick: true,
          textToSpeechCurrentGuide: currentGuide,
        },
        {skipCallback: true},
      );
    } else {
      if (currentGuide && !currentGuide.noDimBackground) {
        const dismissed = guide.dismissCurrentGuide();
        if (dismissed) {
          if (state.textToSpeechLocale) {
            stopTextToSpeech();
          }
          soundLibrary.playSound('other');
        }
      }
    }
  };

  /** Attempts to play text to speech if needed. Returns true if TTS started. */
  attemptTextToSpeech = (inClickHandler: boolean): boolean => {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    if (!state.textToSpeechLocale || !hasTextToSpeechVoices()) {
      return false;
    }

    if (!currentGuide || state.textToSpeechCurrentGuide === currentGuide) {
      return false;
    }

    if (inClickHandler === state.hasTextToSpeechStartedByClick) {
      return false;
    }

    return startTextToSpeech(
      currentGuide.textFn(getState()),
      state.textToSpeechLocale as string,
    );
  };

  render() {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let guideBgStyle: any[] = [styles.guideBackground];
    if (currentGuide) {
      if (currentGuide.noDimBackground) {
        guideBgStyle = [styles.guideBackgroundHidden];
      }

      if (currentGuide.style === 'Info') {
        guideBgStyle.push({backgroundColor: colors.transparentBlack});
      }
    }

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

    if (this.attemptTextToSpeech(false)) {
      setState({textToSpeechCurrentGuide: currentGuide}, {skipCallback: true});
    }

    const renderClickToContinueReminder =
      state.guides === 'K5' &&
      state.guideShowing &&
      currentGuide &&
      !currentGuide.noDimBackground &&
      currentGuide.style !== 'Info';

    return (
      <div>
        {currentGuide && currentGuide.image && (
          <img
            src={currentGuide.image}
            style={
              [
                styles.guideImage,
                currentGuide.imageStyle || {},
              ] as unknown as React.CSSProperties
            }
            alt=""
          />
        )}
        {!!currentGuide && (
          <div>
            <div
              key={currentGuide.id}
              style={guideBgStyle as unknown as React.CSSProperties}
              onClick={this.onGuideClick}
              id="uitest-dismiss-guide"
            >
              <div
                aria-labelledby="guide-heading"
                tabIndex={-1}
                className="guide-dialog"
                style={{
                  ...styles.guide,
                  ...styles[`guide${currentGuide.style}`],
                }}
              >
                <div>
                  {currentGuide.style === 'Info' && (
                    <div id="guide-heading" style={styles.guideHeading}>
                      {I18n.t('didYouKnow')}
                    </div>
                  )}

                  {/* Visible Typist animation for sighted users */}
                  <div style={styles.guideTypingText} aria-hidden="true">
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
                    <div
                      ref={this.guideDialogRef}
                      aria-live="polite"
                      tabIndex={0}
                      onKeyDown={this.onGuideKeyDown}
                      style={styles.guideFinalText}
                    >
                      {currentGuide.textFn(getState())}
                    </div>
                  </div>
                  {renderClickToContinueReminder && (
                    <div style={styles.guideClickToContinueReminderContainer}>
                      <img
                        src={fingerClickIcon1}
                        alt=""
                        style={styles.guideClickToContinueReminder1}
                      />
                      <img
                        src={fingerClickIcon2}
                        alt=""
                        style={styles.guideClickToContinueReminder2}
                      />
                    </div>
                  )}
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
                  ...styles[`arrow${currentGuide.arrow}`],
                }}
                alt=""
              />
            )}
          </div>
        )}
      </div>
    );
  }
};
export default Radium(UnwrappedGuide);
