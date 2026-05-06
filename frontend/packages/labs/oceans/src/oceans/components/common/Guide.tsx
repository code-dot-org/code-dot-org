import Radium from 'radium';
import {
  Component,
  createRef,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import Typist from 'react-typist';

import '@/oceans/styles/fade.css';

import Button from '@/oceans/components/common/Button';
import {OCEANS_UI_CONTAINER_ID} from '@/oceans/constants';
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

/** Clears the guide typing-sound interval timer if one is active. */
export const stopTypingSounds = () => {
  const state = getState();
  if (state.guideTypingTimer) {
    clearInterval(state.guideTypingTimer as ReturnType<typeof setInterval>);
    setState({guideTypingTimer: undefined}, {skipCallback: true});
  }
};

/** Overlay component that renders the current guide dialog, typing animation, and TTS. */
const UnwrappedGuide = class Guide extends Component<Record<string, never>> {
  guideDialogRef = createRef<HTMLDivElement>();
  lastFocusedGuideId: string | null = null;

  componentDidUpdate() {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();
    const currentGuideId = currentGuide ? currentGuide.id : null;

    // Focus management: push focus into the guide when it changes.
    if (
      currentGuideId !== this.lastFocusedGuideId &&
      currentGuide &&
      this.guideDialogRef &&
      this.guideDialogRef.current
    ) {
      this.guideDialogRef.current.focus({preventScroll: false});
      this.lastFocusedGuideId = currentGuideId;
    } else if (!currentGuide) {
      if (this.lastFocusedGuideId !== null) {
        // Guide just cleared — return focus to the first activity button so
        // keyboard users land inside the game instead of on the page shell.
        const firstBtn = document.querySelector<HTMLElement>(
          `#${OCEANS_UI_CONTAINER_ID} button`,
        );
        firstBtn?.focus({preventScroll: true});
      }
      this.lastFocusedGuideId = null;
    }

    // Start typing-sound interval when a new guide appears (no TTS, not yet done).
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

    // Start TTS if needed.
    if (this.attemptTextToSpeech(false)) {
      setState({textToSpeechCurrentGuide: currentGuide}, {skipCallback: true});
    }
  }

  onTypingDone() {
    clearInterval(
      getState().guideTypingTimer as ReturnType<typeof setInterval>,
    );
    setState({guideShowing: true, guideTypingTimer: undefined});
  }

  onGuideKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
      e.preventDefault();
      this.onGuideClick();
    } else if (e.key === 'Tab') {
      // Prevent Tab from escaping the modal when a dimming guide is active.
      // noDimBackground guides leave activity content interactive, so Tab must
      // flow freely through the page in that case.
      const currentGuide = guide.getCurrentGuide();
      if (currentGuide && !currentGuide.noDimBackground) {
        e.preventDefault();
      }
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
              ] as unknown as CSSProperties
            }
            alt=""
          />
        )}
        {!!currentGuide && (
          <div>
            <div
              key={currentGuide.id}
              role="button"
              tabIndex={0}
              ref={this.guideDialogRef}
              style={guideBgStyle as unknown as CSSProperties}
              onClick={this.onGuideClick}
              onKeyDown={this.onGuideKeyDown}
              id="uitest-dismiss-guide"
            >
              <div
                aria-labelledby="guide-heading"
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

                  {/* Invisible final text: screen readers read this as the button label */}
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
