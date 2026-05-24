import {type SxProps, Box, Typography} from '@mui/material';
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

/** Interval between keystroke sound ticks while the guide text is animating. */
const TYPING_SOUND_INTERVAL_MS = 100;

/**
 * Whether `key` is one of the ARIA `role="button"` activation keys.
 *
 * @param key - `KeyboardEvent.key` value to test.
 * @returns true for Enter, Space (' ' on modern UAs, 'Spacebar' on IE/legacy).
 */
const isActivationKey = (key: string): boolean =>
  key === 'Enter' || key === ' ' || key === 'Spacebar';

export const stopTypingSounds = () => {
  const state = getState();
  if (state.guideTypingTimer) {
    clearInterval(state.guideTypingTimer as ReturnType<typeof setInterval>);
    setState({guideTypingTimer: undefined}, {skipCallback: true});
  }
};

/** Per-style sx overrides; default style anchors a dark scrim at the bottom. */
const GUIDE_STYLE_SX: Record<string, SxProps> = {
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

/** Per-arrow position offsets; base position and width are applied at the call site. */
const GUIDE_ARROW_SX: Record<string, SxProps> = {
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
  /** Guide id seen on the last render; used to detect guide transitions. */
  lastGuideId: string | null = null;

  componentDidUpdate() {
    const currentGuide = guide.getCurrentGuide();
    const currentId = currentGuide?.id ?? null;
    if (currentId === this.lastGuideId) return;
    this.lastGuideId = currentId;
    // Move focus to the dialog or to the next scene control as the guide changes.
    if (!currentGuide || currentGuide.noDimBackground) {
      // Fall back to body when the host container isn't present.
      const container =
        document.getElementById('container-react') ?? document.body;
      const target =
        container.querySelector<HTMLElement>('[data-guide-dismiss-focus]') ??
        container.querySelector<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
      target?.focus();
    } else if (currentGuide.style !== 'Info') {
      (
        document.querySelector<HTMLElement>('dialog.guide-dialog') ?? undefined
      )?.focus();
    }
  }

  /**
   * Overlay-only dismissal: fire onGuideClick on Enter / Space, but only when
   * the event originated on the overlay itself.  Bubbles from the inner
   * <dialog> are filtered out by the target check; the dialog's own handler
   * already stops propagation on those keys.
   *
   * @param e - Keyboard event from the overlay Box.
   */
  onOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (isActivationKey(e.key)) {
      e.preventDefault();
      this.onGuideClick();
    }
  };

  /**
   * Dialog dismissal + Tab trap.  Tab is swallowed when the guide is modal;
   * Escape / Enter / Space all dismiss.  Stop propagation so the surrounding
   * overlay's keydown guard doesn't fire a second dismissal.
   *
   * @param e - Keyboard event from the inner <dialog> Box.
   */
  onDialogKeyDown = (e: React.KeyboardEvent) => {
    const isModal = !!(
      guide.getCurrentGuide() && !guide.getCurrentGuide()?.noDimBackground
    );
    if (e.key === 'Tab' && isModal) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Escape' || isActivationKey(e.key)) {
      e.preventDefault();
      e.stopPropagation();
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

  onTypingDone() {
    clearInterval(
      getState().guideTypingTimer as ReturnType<typeof setInterval>,
    );
    setState({guideShowing: true, guideTypingTimer: undefined});
  }

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
      }, TYPING_SOUND_INTERVAL_MS);
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

    /** True when this guide dims background and traps focus. */
    const isModal = !!(currentGuide && !currentGuide.noDimBackground);

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
              role="button"
              tabIndex={0}
              aria-label="Dismiss guide"
              onClick={this.onGuideClick}
              onKeyDown={this.onOverlayKeyDown}
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
              {/* Use <dialog open>, not showModal(): the top layer would escape the canvas-relative coords. */}
              <Box
                component="dialog"
                {...({
                  open: true,
                } as React.DialogHTMLAttributes<HTMLDialogElement>)}
                role="dialog"
                aria-labelledby={
                  currentGuide.style === 'Info' ? 'guide-heading' : undefined
                }
                aria-label={
                  currentGuide.style !== 'Info'
                    ? currentGuide.textFn(getState())
                    : undefined
                }
                aria-modal={isModal || undefined}
                // Programmatic focus only; keep it out of the natural Tab order.
                tabIndex={-1}
                className="guide-dialog"
                onKeyDown={this.onDialogKeyDown}
                sx={
                  {
                    position: 'absolute',
                    backgroundColor: 'var(--ocean-color-transparent-black)',
                    color: 'var(--ocean-color-white)',
                    borderRadius: '5px',
                    maxWidth: '80%',
                    bottom: '2%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    // Reset UA <dialog> defaults.
                    margin: 0,
                    padding: 0,
                    border: 'none',
                    maxHeight: 'none',
                    overflow: 'visible',
                    ...styleOverrideSx,
                  } as SxProps
                }
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
                      aria-live="polite"
                      aria-atomic="true"
                      sx={{
                        padding: GUIDE_DIALOG_PADDING,
                        // Invisible sibling sizes the dialog; aria-live announces the text.
                        color: 'transparent',
                        userSelect: 'none',
                        pointerEvents: 'none',
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
                      // eslint-disable-next-line jsx-a11y/no-autofocus -- sole content of a modal dialog
                      autoFocus
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
                      onClick={this.onGuideClick}
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
                sx={{position: 'absolute', width: '8%', ...arrowSx} as SxProps}
              />
            )}
          </Box>
        )}
      </Box>
    );
  }
}

export default Guide;
