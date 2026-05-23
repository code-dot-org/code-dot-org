import {Box, Typography} from '@mui/material';
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
import {DIALOG_TITLE_FONT_SIZE} from '@/oceans/styles/layout';
import {
  startTextToSpeech,
  stopTextToSpeech,
  hasTextToSpeechVoices,
} from '@/utils/TextToSpeech';

/** Padding applied to both the Typist animation box and the accessible text box. */
const GUIDE_DIALOG_PADDING = '20px';

export const stopTypingSounds = () => {
  const state = getState();
  if (state.guideTypingTimer) {
    clearInterval(state.guideTypingTimer as ReturnType<typeof setInterval>);
    setState({guideTypingTimer: undefined}, {skipCallback: true});
  }
};

/**
 * sx overrides for the guide dialog box keyed by GuideEntry.style.
 * Default (no style) renders a dark scrim anchored at the bottom.
 */
const GUIDE_STYLE_SX: Record<string, object> = {
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

/**
 * sx overrides for the arrow image keyed by GuideEntry.arrow.
 * All arrows share position:absolute + width:8% base.
 */
const GUIDE_ARROW_SX: Record<string, object> = {
  BotRight: {top: '15%', right: '12.5%', transform: 'translateX(-50%)'},
  LowerLeft: {bottom: '17%', left: '8.5%', transform: 'translateX(-50%)'},
  LowerRight: {bottom: '17%', right: '0.75%', transform: 'translateX(-50%)'},
  LowishRight: {bottom: '28%', right: '0.75%', transform: 'translateX(-50%)'},
  LowerCenter: {
    bottom: '22%',
    left: '50.5%',
    transform: 'translateX(-50%)',
  },
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

  // Called from both the guide click handler and the render method, and
  // attempts to play text to speech if needed.  Returns true if it believes
  // it started text to speech.
  attemptTextToSpeechTextToSpeech = (inClickHandler: boolean): boolean => {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    if (!state.textToSpeechLocale || !hasTextToSpeechVoices()) {
      return false;
    }

    if (!currentGuide || state.textToSpeechCurrentGuide === currentGuide) {
      return false;
    }

    // Start first play from a click handler; all subsequent plays on render.
    if (inClickHandler === state.hasTextToSpeechStartedByClick) {
      return false;
    }

    return startTextToSpeech(
      currentGuide.textFn(getState()),
      state.textToSpeechLocale,
    );
  };

  render() {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    // Background overlay sx: hidden, info-darkened, or default scrim.
    const bgSx: React.ComponentProps<typeof Box>['sx'] = currentGuide
      ? currentGuide.noDimBackground
        ? {
            backgroundColor: 'transparent',
            pointerEvents: 'none',
            borderRadius: 0,
          }
        : currentGuide.style === 'Info'
          ? {backgroundColor: 'var(--ocean-color-transparent-black)'}
          : {backgroundColor: 'rgb(0 0 0 / 30%)'}
      : {backgroundColor: 'rgb(0 0 0 / 30%)'};

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
      setState({textToSpeechCurrentGuide: currentGuide}, {skipCallback: true});
    }

    const renderClickToContinueReminder =
      state.guides === 'K5' &&
      state.guideShowing &&
      currentGuide &&
      !currentGuide.noDimBackground &&
      currentGuide.style !== 'Info';

    // Dialog box sx: base + optional style override.
    const styleOverrideSx =
      currentGuide?.style && GUIDE_STYLE_SX[currentGuide.style]
        ? GUIDE_STYLE_SX[currentGuide.style]
        : {};

    const arrowSx =
      currentGuide?.arrow && GUIDE_ARROW_SX[currentGuide.arrow]
        ? GUIDE_ARROW_SX[currentGuide.arrow]
        : {};

    // imageStyle on a GuideEntry is one of two opaque {top,left} object
    // literals from guidesHoc / guidesK5; pass through verbatim.
    const imageStyle = currentGuide?.imageStyle;

    return (
      <Box>
        {currentGuide && currentGuide.image && (
          <Box
            component="img"
            src={currentGuide.image}
            alt=""
            style={imageStyle}
            sx={{
              position: 'absolute',
              bottom: '1%',
              left: '15%',
              zIndex: 2,
              maxHeight: '45%',
              maxWidth: '35%',
            }}
          />
        )}
        {!!currentGuide && (
          <Box>
            <Box
              key={currentGuide.id}
              onClick={this.onGuideClick}
              id="uitest-dismiss-guide"
              sx={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '10px',
                },
                bgSx,
              ]}
            >
              <Box
                aria-labelledby="guide-heading"
                tabIndex={-1}
                className="guide-dialog"
                sx={[
                  {
                    position: 'absolute',
                    backgroundColor: 'var(--ocean-color-transparent-black)',
                    color: 'var(--ocean-color-white)',
                    borderRadius: '5px',
                    maxWidth: '80%',
                    bottom: '2%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  },
                  styleOverrideSx,
                ]}
              >
                <Box>
                  {currentGuide.style === 'Info' && (
                    <Typography
                      id="guide-heading"
                      sx={{
                        fontSize: DIALOG_TITLE_FONT_SIZE,
                        color: 'var(--ocean-color-dark-grey)',
                        paddingBottom: '5%',
                        textAlign: 'center',
                      }}
                    >
                      {I18n.t('didYouKnow')}
                    </Typography>
                  )}

                  {/* Visible Typist animation for sighted users */}
                  <Box
                    sx={{position: 'absolute', padding: GUIDE_DIALOG_PADDING}}
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
                    <Box
                      ref={this.guideDialogRef}
                      aria-live="polite"
                      tabIndex={0}
                      onKeyDown={this.onGuideKeyDown}
                      sx={{
                        padding: GUIDE_DIALOG_PADDING,
                        color: 'rgb(0 0 0 / 0%)',
                      }}
                    >
                      {currentGuide.textFn(getState())}
                    </Box>
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
                      sx={{
                        backgroundColor: 'var(--ocean-color-orange)',
                        color: 'var(--ocean-color-white)',
                        transform: 'translate(-50%)',
                        marginLeft: '50%',
                        marginTop: '2%',
                        padding: '3% 7%',
                        '&:hover': {
                          backgroundColor: 'var(--ocean-color-orange)',
                        },
                      }}
                      onClick={() => {}}
                    >
                      {I18n.t('continue')}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
            {currentGuide.arrow && (
              <Box
                component="img"
                src={arrowDownImage}
                alt=""
                sx={[{position: 'absolute', width: '8%'}, arrowSx]}
              />
            )}
          </Box>
        )}
      </Box>
    );
  }
}

export default Guide;
