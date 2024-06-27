import React from 'react'
import Radium from "radium";
import Typist from "react-typist";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowCircleDown} from "@fortawesome/free-solid-svg-icons";

import "@ml/oceans/styles/bounce.css";

import {getState, setState} from "@ml/oceans/state";
import guide from "@ml/oceans/models/guide";
import soundLibrary from "@ml/oceans/models/soundLibrary";
import styles from "@ml/oceans/styles";
import colors from "@ml/oceans/styles/colors";
import I18n from "@ml/oceans/i18n";
import {Button} from "@ml/oceans/components/common";
import arrowDownImage from "@public/images/arrow-down.png";

let UnwrappedGuide = class Guide extends React.Component {
  onShowing() {
    clearInterval(getState().guideTypingTimer);
    setState({guideShowing: true, guideTypingTimer: null});
  }

  dismissGuideClick() {
    const dismissed = guide.dismissCurrentGuide();
    if (dismissed) {
      soundLibrary.playSound('other');
    }
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
                    {!getState().guideTypingTimer && currentGuide.style !== 'Info' && (
                      <div style={{display: 'flex', justifyContent: 'flex-end', height: 30, alignItems: 'end'}}>
                        <FontAwesomeIcon icon={faArrowCircleDown} className="bounce" />
                      </div>
                    )}
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
                      {currentGuide.style !== 'Info' && (
                        <div style={{display: 'flex', justifyContent: 'flex-end', height: 30, alignItems: 'end'}}>
                          <FontAwesomeIcon icon={faArrowCircleDown} className="bounce" />
                        </div>
                      )}
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
