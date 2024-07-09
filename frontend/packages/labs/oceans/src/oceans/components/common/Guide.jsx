import React from 'react'
import Radium from "radium";
import Typist from "react-typist";

import "@ml/oceans/styles/fade.css";

import {getState, setState} from "@ml/oceans/state";
import guide from "@ml/oceans/models/guide";
import soundLibrary from "@ml/oceans/models/soundLibrary";
import styles from "@ml/oceans/styles";
import colors from "@ml/oceans/styles/colors";
import I18n from "@ml/oceans/i18n";
import {Button} from "@ml/oceans/components/common";
import arrowDownImage from "@public/images/arrow-down.png";
import fingerClickIcon1 from "@public/images/finger-click-icon-1.svg";
import fingerClickIcon2 from "@public/images/finger-click-icon-2.svg";

let UnwrappedGuide = class Guide extends React.Component {
  onShowing() {
    clearInterval(getState().guideTypingTimer);
    setState({guideShowing: true, guideTypingTimer: null});

    if (!guide.getCurrentGuide().noDimBackground) {
      const timerId = setTimeout(() => {
        setState({showClickToContinue: true});
        const intervalId = setInterval(() => setState({clickToContinueIconFrame1: !getState().clickToContinueIconFrame1}), 400);
        setState({clickToContinueAnimationIntervalId: intervalId});
      }, 2000);
      setState({clickToContinueTimerId: timerId});
    }
  }

  dismissGuideClick() {
    const dismissed = guide.dismissCurrentGuide();
    if (dismissed) {
      soundLibrary.playSound('other');

      setState({showClickToContinue: false});
      const {
        clickToContinueTimerId,
        clickToContinueAnimationIntervalId
      } = getState();
      if (clickToContinueTimerId) {
        clearTimeout(clickToContinueTimerId);
        setState({clickToContinueTimerId: null});
      }
      if (clickToContinueAnimationIntervalId) {
        clearTimeout(clickToContinueAnimationIntervalId);
        setState({clickToContinueAnimationIntervalId: null});
      }
    }
  }

  renderClickToContinueReminder(currentGuide) {
    return (
      getState().showClickToContinue && currentGuide.style !== 'Info' && !currentGuide.noDimBackground && (
        <div style={styles.guideClickToContinueReminderContainer} className="fade">
          <img
            style={getState().clickToContinueIconFrame1 ? styles.guideHideClickToContinueAnimationFrame : {}}
            src={fingerClickIcon1}
            alt={'A clicking animation reminding users to click anywhere to continue.'}
          />
          <img
            style={getState().clickToContinueIconFrame1 ? {} : styles.guideHideClickToContinueAnimationFrame}
            src={fingerClickIcon2}
          />
        </div>
      ))
  }

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
    if (!state.guideShowing && !state.guideTypingTimer && currentGuide) {
      const guideTypingTimer = setInterval(() => {
        soundLibrary.playSound('no', 0.5);
      }, 1000 / 10);
      setState({guideTypingTimer});
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
              onClick={this.dismissGuideClick}
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
                      onTypingDone={this.onShowing}
                    >
                      {currentGuide.textFn(getState())}
                    </Typist>
                    {this.renderClickToContinueReminder(currentGuide)}
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
                      {this.renderClickToContinueReminder(currentGuide)}
                    </div>
                  </div>
                  {currentGuide.style === 'Info' && (
                    <Button
                      style={styles.infoGuideButton} onClick={() => {
                    }}
                    >
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
