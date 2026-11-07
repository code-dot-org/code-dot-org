/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import * as React from 'react';
import Typist from 'react-typist';

import '@/oceans/styles/fade.css';

import arrowDownImage from '@/assets/images/arrow-down.png';
import fingerClickIcon1 from '@/assets/images/finger-click-icon-1.svg';
import fingerClickIcon2 from '@/assets/images/finger-click-icon-2.svg';
import Button from '@/oceans/components/common/Button';
import I18n from '@/oceans/i18n';
import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';
import {getState, setState} from '@/oceans/state';
import {
  startTextToSpeech,
  stopTextToSpeech,
  hasTextToSpeechVoices,
} from '@/utils/TextToSpeech';

export const stopTypingSounds = () => {
  const state = getState();
  if (state.guideTypingTimer) {
    clearInterval(state.guideTypingTimer as ReturnType<typeof setInterval>);
    setState({guideTypingTimer: undefined}, {skipCallback: true});
  }
};

/**
 * Map a `GuideEntry.style` value to its modifier class name.  The
 * registry's keys are typed as strings ("Info" / "Center" / etc.); we
 * mirror them here to a small registry so the lookup is type-safe.
 */
const GUIDE_STYLE_CLASS: Record<string, string> = {
  Info: 'ocean-guide--info',
  Center: 'ocean-guide--center',
};

/**
 * The enabled lab button under a tap on the guide's dimmed background, if
 * any.  Taps on the guide's own text box never reach the lab underneath.
 */
const findButtonUnderScrim = (event: React.MouseEvent): HTMLElement | null => {
  const elements = document.elementsFromPoint(event.clientX, event.clientY);
  if (elements[0]?.closest('.guide-dialog')) {
    return null;
  }
  for (const element of elements) {
    const button = element.closest<HTMLElement>('.ocean-button');
    if (
      button &&
      !button.closest('.guide-dialog') &&
      button.getAttribute('aria-disabled') !== 'true'
    ) {
      return button;
    }
  }
  return null;
};

/** Map a `GuideEntry.arrow` value to its modifier class name. */
const GUIDE_ARROW_CLASS: Record<string, string> = {
  BotRight: 'ocean-guide__arrow--bot-right',
  LowerLeft: 'ocean-guide__arrow--lower-left',
  LowerRight: 'ocean-guide__arrow--lower-right',
  LowishRight: 'ocean-guide__arrow--lowish-right',
  LowerCenter: 'ocean-guide__arrow--lower-center',
  UpperRight: 'ocean-guide__arrow--upper-right',
  UpperFarRight: 'ocean-guide__arrow--upper-far-right',
};

// Minimum time to read a completed message before advancing.
const GUIDE_CONTINUE_DELAY_MS = 500;

class Guide extends React.Component<Record<string, never>> {
  guideDialogRef = React.createRef<HTMLDivElement>();
  lastFocusedGuideId: string | null = null;

  lastTypingGuideId: string | null = null;
  /** Guide whose typing animation was skipped by a tap; its full text shows. */
  skippedGuideId: string | null = null;
  canContinueAt = 0;

  componentDidUpdate() {
    // Focus the dialog only when the guide changes, not on every re-render
    const currentGuide = guide.getCurrentGuide();
    const currentGuideId = currentGuide ? currentGuide.id : null;


    // Reset the skip state and delay when a new dialogue appears.
    if (currentGuideId !== this.lastTypingGuideId) {
      this.skippedGuideId = null;
      this.canContinueAt = 0;
      this.lastTypingGuideId = currentGuideId;
    }

    if (
      currentGuideId !== this.lastFocusedGuideId &&
      currentGuide &&
      this.guideDialogRef &&
      this.guideDialogRef.current
    ) {
      // `focusVisible` is a non-standard option (Firefox extension) accepted
      // by some browsers; cast since it isn't in lib.dom's FocusOptions.
      this.guideDialogRef.current.focus({focusVisible: false} as FocusOptions);
      this.lastFocusedGuideId = currentGuideId;
    } else if (!currentGuide) {
      this.lastFocusedGuideId = null;
    }
  }
  onTypingDone = () => {
  // Start the 500ms pause after typing finishes
  this.canContinueAt = Date.now() + GUIDE_CONTINUE_DELAY_MS;

  clearInterval(
    getState().guideTypingTimer as ReturnType<typeof setInterval>,
  );

  setState({guideShowing: true, guideTypingTimer: undefined});
  };

  onGuideKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
      e.preventDefault();
      this.onGuideClick();
    }
  };

  closeGuide = (guideId: string): boolean => {
    const dismissed = guide.dismissGuide(guideId);

    if (dismissed && getState().textToSpeechLocale) {
      stopTextToSpeech();
    }

    return dismissed;
  };

  onGuideClick = (event?: React.MouseEvent) => {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    if (!currentGuide) return;

    // Preserve existing text-to-speech initiation.
    if (this.attemptTextToSpeechTextToSpeech(true)) {
      setState(
        {
          hasTextToSpeechStartedByClick: true,
          textToSpeechCurrentGuide: currentGuide,
        },
        {skipCallback: true},
      );
    }

    // FIRST CLICK: Reveal the entire text immediately.
    if (!state.guideShowing) {
      this.skippedGuideId = currentGuide.id;
      this.onTypingDone();
      return;
    }

    // Prevent advancing during the 500ms pause.
    if (Date.now() < this.canContinueAt) {
      return;
    }

    // Don't dismiss guides without a modal background.
    if (currentGuide.noDimBackground) {
      return;
    }

    // Allow clicking an eligible button behind the overlay,
    // but only after text is fully displayed and delay passes.
    const buttonUnderTap =
      event && currentGuide.style !== 'Info'
        ? findButtonUnderScrim(event)
        : null;

    if (buttonUnderTap) {
      const dismissed = this.closeGuide(currentGuide.id);

      if (dismissed) {
        buttonUnderTap.click();
      }

      return;
    }

    // Info guides must use their Continue button.
    if (currentGuide.style === 'Info') {
      return;
    }

    // Otherwise, advance or dismiss normally.
    if (guide.dismissCurrentGuide()) {
      if (state.textToSpeechLocale) {
        stopTextToSpeech();
      }
      soundLibrary.playSound('other');
    }
  };
  // Called from both the guide click handler and the render method, and
  // attempts to play text to speech if needed.  Returns true if it believes
  // it started text to speech.
  attemptTextToSpeechTextToSpeech = (inClickHandler: boolean): boolean => {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    // Do nothing if text to speech is not desired or yet available.
    if (!state.textToSpeechLocale || !hasTextToSpeechVoices()) {
      return false;
    }

    // Do nothing if there is no current guide, or if we've already started
    // text to speech for the current guide (which might have finished
    // playing by now).
    if (!currentGuide || state.textToSpeechCurrentGuide === currentGuide) {
      return false;
    }

    // In this implementation, we want to start the first play of text to
    // speech from a click handler, but all subsequent plays when we first
    // render a new piece of text, rather than from a click handler.
    // Therefore:
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
      state.textToSpeechLocale,
    );
  };

  render() {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    // Background variant: hidden, info-darkened, or the default scrim.
    let bgClassName = 'ocean-guide__bg';
    if (currentGuide) {
      if (currentGuide.noDimBackground) {
        bgClassName = 'ocean-guide__bg ocean-guide__bg--hidden';
      } else if (currentGuide.style === 'Info') {
        bgClassName = 'ocean-guide__bg ocean-guide__bg--info';
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

    if (this.attemptTextToSpeechTextToSpeech(false)) {
      // This call started text to speech.
      setState({textToSpeechCurrentGuide: currentGuide}, {skipCallback: true});
    }

    const renderClickToContinueReminder =
      state.guides === 'K5' &&
      state.guideShowing &&
      currentGuide &&
      !currentGuide.noDimBackground &&
      currentGuide.style !== 'Info';

    const guideClassName =
      currentGuide &&
      currentGuide.style &&
      GUIDE_STYLE_CLASS[currentGuide.style]
        ? `ocean-guide ${GUIDE_STYLE_CLASS[currentGuide.style]}`
        : 'ocean-guide';

    const arrowClassName =
      currentGuide &&
      currentGuide.arrow &&
      GUIDE_ARROW_CLASS[currentGuide.arrow]
        ? `ocean-guide__arrow ${GUIDE_ARROW_CLASS[currentGuide.arrow]}`
        : 'ocean-guide__arrow';

    // imageStyle on a GuideEntry is one of two opaque {top,left} object
    // literals from guidesHoc / guidesK5; pass through verbatim.
    const imageStyle = currentGuide?.imageStyle;

    const typingSkipped =
      !!currentGuide && this.skippedGuideId === currentGuide.id;

    return (
      <div>
        {currentGuide && currentGuide.image && (
          <img
            src={currentGuide.image}
            className="ocean-guide__image"
            style={imageStyle}
            alt=""
          />
        )}
        {!!currentGuide && (
          <div>
            <div
              key={currentGuide.id}
              className={bgClassName}
              onClick={this.onGuideClick}
              id="uitest-dismiss-guide"
            >
              <div
                aria-labelledby="guide-heading"
                tabIndex={-1}
                className={`guide-dialog ${guideClassName}`}
              >
                <div>
                  {currentGuide.style === 'Info' && (
                    <div id="guide-heading" className="ocean-guide__heading">
                      {I18n.t('didYouKnow')}
                    </div>
                  )}

                  {/* Visible Typist animation for sighted users */}
                  {!typingSkipped && (
                    <div
                      className="ocean-guide__typing-text"
                      aria-hidden="true"
                    >
                      <Typist
                        avgTypingDelay={35}
                        stdTypingDelay={15}
                        cursor={{show: false}}
                        onTypingDone={this.onTypingDone}
                      >
                        {currentGuide.textFn(getState())}
                      </Typist>
                    </div>
                  )}

                  <div
                    className={
                      currentGuide.style === 'Info'
                        ? 'ocean-guide__final-text-container--info'
                        : undefined
                    }
                  >
                    <div
                      ref={this.guideDialogRef}
                      aria-live="polite"
                      tabIndex={0}
                      onKeyDown={this.onGuideKeyDown}
                      className={
                        typingSkipped
                          ? 'ocean-guide__final-text ocean-guide__final-text--shown'
                          : 'ocean-guide__final-text'
                      }
                    >
                      {currentGuide.textFn(getState())}
                    </div>
                  </div>
                  {renderClickToContinueReminder && (
                    <div className="ocean-guide__continue-reminder">
                      <img
                        src={fingerClickIcon1}
                        alt=""
                        className="ocean-guide__continue-reminder-1"
                      />
                      <img
                        src={fingerClickIcon2}
                        alt=""
                        className="ocean-guide__continue-reminder-2"
                      />
                    </div>
                  )}
                  {currentGuide.style === 'Info' && (
                    <Button
                      className="ocean-guide__info-button"
                      onClick={event => {
                        event.stopPropagation();

                        if (!getState().guideShowing) {
                          this.skippedGuideId = currentGuide.id;
                          this.onTypingDone();
                          return;
                        }

                        if (Date.now() < this.canContinueAt) {
                          return;
                        }

                        this.closeGuide(currentGuide.id);
                      }}
                    >
                      {I18n.t('continue')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {currentGuide.arrow && (
              <img src={arrowDownImage} className={arrowClassName} alt="" />
            )}
          </div>
        )}
      </div>
    );
  }
}
export default Guide;
