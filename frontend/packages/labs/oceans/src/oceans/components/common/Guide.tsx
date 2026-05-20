/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import Box from '@mui/material/Box';
import type {SxProps, Theme} from '@mui/material/styles';
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

/** Base sx for the guide bubble. */
const GUIDE_BASE_SX: SxProps<Theme> = {
  position: 'absolute',
  backgroundColor: 'var(--ocean-color-transparent-black)',
  color: 'var(--ocean-color-white)',
  borderRadius: '5px',
  maxWidth: '80%',
  bottom: '2%',
  left: '50%',
  transform: 'translateX(-50%)',
};

/** Additional sx merged in for each guide style variant. */
const GUIDE_STYLE_SX: Record<string, SxProps<Theme>> = {
  Info: {
    backgroundColor: 'var(--ocean-color-white)',
    color: 'var(--ocean-color-dark-grey)',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    bottom: 'initial',
    left: '50%',
    padding: '2%',
  },
  Center: {
    top: '50%',
    left: '50%',
    bottom: 'initial',
    maxWidth: '47%',
    transform: 'translate(-50%, -50%)',
  },
};

/** Base sx for the arrow image. */
const ARROW_BASE_SX: SxProps<Theme> = {
  position: 'absolute',
  width: '8%',
};

/** Additional sx for each arrow placement. */
const GUIDE_ARROW_SX: Record<string, SxProps<Theme>> = {
  BotRight: {top: '15%', right: '12.5%', transform: 'translateX(-50%)'},
  LowerLeft: {bottom: '17%', left: '8.5%', transform: 'translateX(-50%)'},
  LowerRight: {bottom: '17%', right: '0.75%', transform: 'translateX(-50%)'},
  LowishRight: {bottom: '28%', right: '0.75%', transform: 'translateX(-50%)'},
  LowerCenter: {bottom: '22%', left: '50.5%', transform: 'translateX(-50%)'},
  UpperRight: {
    top: '13%',
    right: '-2%',
    transform: 'translateX(-50%) rotate(180deg)',
  },
  UpperFarRight: {
    top: '15%',
    right: '-4.6%',
    transform: 'translateX(-50%) rotate(180deg)',
  },
};

class Guide extends React.Component<Record<string, never>> {
  guideDialogRef = React.createRef<HTMLDivElement>();
  lastFocusedGuideId: string | null = null;

  componentDidUpdate() {
    // Focus the dialog only when the guide changes, not on every re-render
    const currentGuide = guide.getCurrentGuide();
    const currentGuideId = currentGuide ? currentGuide.id : null;

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

    if (this.attemptTextToSpeechTextToSpeech(true)) {
      // This click started text to speech.
      setState(
        {
          hasTextToSpeechStartedByClick: true,
          textToSpeechCurrentGuide: currentGuide,
        },
        {skipCallback: true},
      );
    } else {
      // Make sure we don't try and dismiss a guide if it's
      // not modal.
      if (currentGuide && !currentGuide.noDimBackground) {
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

    // Background scrim: hidden, info-darkened, or default semi-transparent.
    const bgSx: SxProps<Theme> = {
      backgroundColor: currentGuide?.noDimBackground
        ? 'transparent'
        : currentGuide?.style === 'Info'
          ? 'var(--ocean-color-transparent-black)'
          : 'rgb(0 0 0 / 30%)',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: currentGuide?.noDimBackground ? 0 : '10px',
      pointerEvents: currentGuide?.noDimBackground ? 'none' : undefined,
    };

    // Guide bubble: base position + style-variant overrides.
    const guideSx: SxProps<Theme> = {
      ...GUIDE_BASE_SX,
      ...(currentGuide?.style ? GUIDE_STYLE_SX[currentGuide.style] : {}),
    } as SxProps<Theme>;

    // Arrow image position.
    const arrowSx: SxProps<Theme> = {
      ...ARROW_BASE_SX,
      ...(currentGuide?.arrow ? GUIDE_ARROW_SX[currentGuide.arrow] : {}),
    } as SxProps<Theme>;

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

    return (
      <Box>
        {currentGuide && currentGuide.image && (
          <Box
            component="img"
            src={currentGuide.image}
            sx={{
              position: 'absolute',
              bottom: '1%',
              left: '15%',
              zIndex: 2,
              maxHeight: '45%',
              maxWidth: '35%',
            }}
            style={currentGuide.imageStyle}
            alt=""
          />
        )}
        {!!currentGuide && (
          <Box>
            <Box
              key={currentGuide.id}
              sx={bgSx}
              onClick={this.onGuideClick}
              id="uitest-dismiss-guide"
            >
              <Box aria-labelledby="guide-heading" tabIndex={-1} sx={guideSx}>
                <Box>
                  {currentGuide.style === 'Info' && (
                    <Box
                      id="guide-heading"
                      sx={{
                        fontSize: '220%',
                        color: 'var(--ocean-color-dark-grey)',
                        paddingBottom: '5%',
                        textAlign: 'center',
                      }}
                    >
                      {I18n.t('didYouKnow')}
                    </Box>
                  )}

                  {/* Visible Typist animation for sighted users */}
                  <Box
                    sx={{position: 'absolute', padding: '20px'}}
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
                  </Box>

                  <Box
                    sx={
                      currentGuide.style === 'Info'
                        ? {
                            backgroundColor: 'var(--ocean-color-light-grey)',
                            borderRadius: '10px',
                          }
                        : undefined
                    }
                  >
                    <div
                      ref={this.guideDialogRef}
                      className="guide-dialog"
                      aria-live="polite"
                      tabIndex={0}
                      onKeyDown={this.onGuideKeyDown}
                      style={{padding: '20px', color: 'rgb(0 0 0 / 0%)'}}
                    />
                  </Box>
                  {renderClickToContinueReminder && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: '1%',
                        bottom: 0,
                        width: '5%',
                        minWidth: '25px',
                        height: '15px',
                        animation:
                          '0.25s ease-in 4s 1 normal backwards running fadein',
                      }}
                    >
                      <Box
                        component="img"
                        src={fingerClickIcon1}
                        alt=""
                        sx={{width: '100%', position: 'absolute'}}
                      />
                      <Box
                        component="img"
                        src={fingerClickIcon2}
                        alt=""
                        sx={{
                          animation:
                            '1s linear 0.5s infinite normal none running blink',
                          width: '100%',
                          position: 'absolute',
                        }}
                      />
                    </Box>
                  )}
                  {currentGuide.style === 'Info' && (
                    <Button
                      onClick={() => {}}
                      sx={{
                        backgroundColor: 'var(--ocean-color-orange)',
                        color: 'var(--ocean-color-white)',
                        transform: 'translate(-50%)',
                        marginLeft: '50%',
                        marginTop: '2%',
                        padding: '3% 7%',
                      }}
                    >
                      {I18n.t('continue')}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
            {currentGuide.arrow && (
              <Box component="img" src={arrowDownImage} sx={arrowSx} alt="" />
            )}
          </Box>
        )}
      </Box>
    );
  }
}
export default Guide;
