import React from 'react'
import _ from "lodash";
import Radium from "radium";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan, faCheck, faInfo} from "@fortawesome/free-solid-svg-icons";

import {getState, setState} from "@ml/oceans/state";
import styles from "@ml/oceans/styles";
import I18n from "@ml/oceans/i18n";
import soundLibrary from "@ml/oceans/models/soundLibrary";
import {arrangeFish} from "@ml/oceans/models/pond";
import helpers, {$time} from "@ml/oceans/helpers";
import guide from "@ml/oceans/models/guide";
import constants, {AppMode, Modes} from "@ml/oceans/constants";
import {Body, Button} from "@ml/oceans/components/common";
import aiBotClosed from "@public/images/ai-bot/ai-bot-closed.png";
import modeHelpers from "@ml/oceans/modeHelpers";
import PondPanel from "@ml/oceans/components/scenes/pond/PondPanel";

function Collide(x1, y1, w1, h1, x2, y2, w2, h2) {
  // Detect a non-collision.
  if (
    x1 + w1 - 1 < x2 ||
    x1 > x2 + w2 - 1 ||
    y1 + h1 - 1 < y2 ||
    y1 > y2 + h2 - 1
  ) {
    return false;
  }

  // Otherwise we have a collision.
  return true;
}


let UnwrappedPond = class Pond extends React.Component {
  constructor(props) {
    super(props);
  }

  toggleRecall = e => {
    const state = getState();

    // No-op if transition is already in progress.
    if (state.pondFishTransitionStartTime) {
      return;
    }

    let currentFishSet, nextFishSet;
    if (state.showRecallFish) {
      currentFishSet = state.recallFish;
      nextFishSet = state.pondFish;
      soundLibrary.playSound('yes');
    } else {
      currentFishSet = state.pondFish;
      nextFishSet = state.recallFish;
      soundLibrary.playSound('no');
    }

    // Don't call arrangeFish if fish have already been arranged.
    if (nextFishSet.length > 0 && !nextFishSet[0].getXY()) {
      arrangeFish(nextFishSet);
    }

    if (currentFishSet.length === 0) {
      // Immediately transition to nextFishSet rather than waiting for empty animation.
      setState({showRecallFish: !state.showRecallFish, pondClickedFish: null});
    } else {
      setState({pondFishTransitionStartTime: $time(), pondClickedFish: null});
    }

    if (e) {
      e.stopPropagation();
    }
  };

  onPondClick = e => {
    // Don't allow pond clicks if a Guide is currently showing.
    if (guide.getCurrentGuide()) {
      return;
    }

    const state = getState();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

    const boundingRect = e.target.getBoundingClientRect();
    const pondWidth = boundingRect.width;
    const pondHeight = boundingRect.height;

    // Scale the click to the pond canvas dimensions.
    const normalizedClickX = (clickX / pondWidth) * constants.canvasWidth;
    const normalizedClickY = (clickY / pondHeight) * constants.canvasHeight;

    const fishCollection = state.showRecallFish
      ? state.recallFish
      : state.pondFish;

    if (state.pondFishBounds) {
      let fishClicked = false;
      // Look through the array in reverse so that we click on a fish that
      // is rendered topmost.
      _.reverse(state.pondFishBounds).forEach(fishBound => {
        // If we haven't already clicked on a fish in this current iteration,
        // and we're not clicking on a fish that is already actively clicked,
        // and we have a collision, then we have clicked on a new fish!
        if (
          !fishClicked &&
          !(
            state.pondClickedFish &&
            fishBound.fishId === state.pondClickedFish.id
          ) &&
          Collide(
            fishBound.x,
            fishBound.y,
            fishBound.w,
            fishBound.h,
            normalizedClickX,
            normalizedClickY,
            1,
            1
          )
        ) {
          setState({
            pondClickedFish: {
              id: fishBound.fishId,
              x: fishBound.x,
              y: fishBound.y
            }
          });
          fishClicked = true;
          soundLibrary.playSound('yes');

          if (
            state.appMode === AppMode.FishShort ||
            state.appMode === AppMode.FishLong
          ) {
            const clickedFish = fishCollection.find(
              f => f.id === fishBound.fishId
            );
            setState({
              pondExplainFishSummary: state.trainer.explainFish(clickedFish)
            });
            if (normalizedClickX < constants.canvasWidth / 2) {
              setState({pondPanelSide: 'right'});
            } else {
              setState({pondPanelSide: 'left'});
            }
          }
        }
      });

      if (!fishClicked) {
        setState({pondClickedFish: null});
        soundLibrary.playSound('no');
      }
    }
  };

  onPondPanelButtonClick = e => {
    const state = getState();

    if ([AppMode.FishShort, AppMode.FishLong].includes(state.appMode)) {
      setState({
        pondPanelShowing: !state.pondPanelShowing
      });

      if (state.pondPanelShowing) {
        soundLibrary.playSound('sortno');
      } else {
        soundLibrary.playSound('sortyes');
      }
    }

    if (e) {
      e.stopPropagation();
    }
  };

  render() {
    const state = getState();

    const showInfoButton =
      [AppMode.FishShort, AppMode.FishLong].includes(state.appMode) &&
      state.pondFish.length > 0 &&
      state.recallFish.length > 0;
    const recallIconsStyle = showInfoButton
      ? styles.recallIcons
      : {...styles.recallIcons, right: '1.2%'};

    return (
      <Body>
        <div onClick={this.onPondClick} style={styles.pondSurface} />
        <div style={recallIconsStyle}>
          <FontAwesomeIcon
            icon={faCheck}
            style={{
              ...styles.recallIcon,
              ...{borderTopLeftRadius: 8, borderBottomLeftRadius: 8},
              ...(state.showRecallFish ? {} : styles.bgGreen)
            }}
            onClick={this.toggleRecall}
          />
          <FontAwesomeIcon
            icon={faBan}
            style={{
              ...styles.recallIcon,
              ...{borderTopRightRadius: 8, borderBottomRightRadius: 8},
              ...(state.showRecallFish ? styles.bgRed : {})
            }}
            onClick={this.toggleRecall}
          />
        </div>
        {showInfoButton && (
          <div
            style={{
              ...styles.infoIconContainer,
              ...(!state.pondPanelShowing ? {} : styles.bgTeal)
            }}
            onClick={this.onPondPanelButtonClick}
            id="uitest-info-btn"
          >
            <FontAwesomeIcon icon={faInfo} style={styles.infoIcon} />
          </div>
        )}
        <img style={styles.pondBot} src={aiBotClosed} />
        {state.canSkipPond && (
          <div id="uitest-nav-btns">
            {state.appMode === AppMode.FishLong ? (
              <div>
                <Button
                  style={styles.playAgainButton}
                  onClick={() => {
                    setState({pondClickedFish: null, pondPanelShowing: false});
                    helpers.resetTraining(state);
                    modeHelpers.toMode(Modes.Words);
                  }}
                >
                  {I18n.t('newWord')}
                </Button>
                <Button style={styles.finishButton} onClick={state.onContinue}>
                  {I18n.t('finish')}
                </Button>
              </div>
            ) : (
              <Button style={styles.continueButton} onClick={state.onContinue}>
                {I18n.t('continue')}
              </Button>
            )}
            <div>
              <Button
                style={styles.backButton}
                onClick={() => {
                  modeHelpers.toMode(Modes.Training);
                  setState({pondClickedFish: null, pondPanelShowing: false});
                }}
              >
                {I18n.t('trainMore')}
              </Button>
            </div>
          </div>
        )}
        {state.pondPanelShowing && <PondPanel />}
      </Body>
    );
  }
};
export default Radium(UnwrappedPond);
