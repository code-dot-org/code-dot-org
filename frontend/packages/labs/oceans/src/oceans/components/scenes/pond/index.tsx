import {faBan, faCheck, faInfo} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import _ from 'lodash';
import * as React from 'react';

import aiBotClosed from '@/assets/images/ai-bot/ai-bot-closed.png';
import {Body, Button} from '@/oceans/components/common';
import PondPanel from '@/oceans/components/scenes/pond/PondPanel';
import constants, {AppMode, Modes} from '@/oceans/constants';
import helpers, {$time} from '@/oceans/helpers';
import I18n from '@/oceans/i18n';
import modeHelpers from '@/oceans/modeHelpers';
import guide from '@/oceans/models/guide';
import {arrangeFish} from '@/oceans/models/pond';
import soundLibrary from '@/oceans/models/soundLibrary';
import {getState, setState} from '@/oceans/state';
import SVMTrainer from '@/utils/SVMTrainer';

/** True when the current mode trains an SVM on word-attribute fish. */
function isFishVariantMode(appMode: string | null): boolean {
  return appMode === AppMode.FishShort || appMode === AppMode.FishLong;
}

function Collide(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
): boolean {
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

/** Shared base sx for the matching/non-matching toggle icon buttons. */
const TOGGLE_BASE_SX = {
  cursor: 'pointer',
  height: '100%',
  width: '50%',
  border: 'none',
  padding: '12%',
  display: 'flex',
  margin: 0,
  '&:focus': {position: 'relative', zIndex: 1},
} as const;

class Pond extends React.Component {
  constructor(props: Record<string, never>) {
    super(props);
  }

  getMatchingFishSet = (e: React.MouseEvent | null, showMatching: boolean) => {
    const state = getState();

    // No-op if transition is already in progress or if already showing the desired fish set.
    // Note that recallFish are fish that are not matching the word/attribute.
    // pondFish are fish that are matching the word/attribute.
    // showMatching true -> want matching (showRecallFish false)
    // showMatching false -> want recalled fish (showRecallFish true).
    if (
      state.pondFishTransitionStartTime ||
      state.showRecallFish === !showMatching
    ) {
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
    if (nextFishSet.length > 0 && !nextFishSet[0].getXY?.()) {
      arrangeFish(nextFishSet as unknown as Parameters<typeof arrangeFish>[0]);
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

  onPondClick = (e: React.MouseEvent) => {
    // Don't allow pond clicks if a Guide is currently showing.
    if (guide.getCurrentGuide()) {
      return;
    }

    const state = getState();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

    const boundingRect = (e.target as HTMLElement).getBoundingClientRect();
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
            1,
          )
        ) {
          setState({
            pondClickedFish: {
              id: fishBound.fishId,
              x: fishBound.x,
              y: fishBound.y,
            },
          });
          fishClicked = true;
          soundLibrary.playSound('yes');

          if (
            state.appMode === AppMode.FishShort ||
            state.appMode === AppMode.FishLong
          ) {
            const clickedFish = fishCollection.find(
              f => f.id === fishBound.fishId,
            );
            if (
              clickedFish &&
              clickedFish.knnData &&
              state.trainer instanceof SVMTrainer
            ) {
              setState({
                pondExplainFishSummary: state.trainer.explainFish({
                  knnData: clickedFish.knnData,
                  fieldInfos: clickedFish.fieldInfos,
                }),
              });
            }
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

  onPondPanelButtonClick = (e: React.MouseEvent | null) => {
    const state = getState();

    if (isFishVariantMode(state.appMode)) {
      setState({
        pondPanelShowing: !state.pondPanelShowing,
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
      isFishVariantMode(state.appMode) &&
      state.pondFish.length > 0 &&
      state.recallFish.length > 0;

    // When the info button is hidden, the recall icons shift to the lab's
    // right edge to take its place.
    const recallIconsRight = showInfoButton ? '7%' : '1.2%';

    // Active toggle gets a coloured background; inactive is white.
    const matchingBg = state.showRecallFish
      ? {
          backgroundColor: 'var(--ocean-color-white)',
          color: 'var(--ocean-color-grey)',
        }
      : {
          backgroundColor: 'var(--ocean-color-green)',
          color: 'var(--ocean-color-white)',
        };
    const nonMatchingBg = state.showRecallFish
      ? {
          backgroundColor: 'var(--ocean-color-red)',
          color: 'var(--ocean-color-white)',
        }
      : {
          backgroundColor: 'var(--ocean-color-white)',
          color: 'var(--ocean-color-grey)',
        };

    return (
      <Body>
        <Box
          role="button"
          aria-label="Fish pond"
          tabIndex={0}
          onClick={this.onPondClick as React.MouseEventHandler<HTMLElement>}
          onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setState({pondClickedFish: null});
            }
          }}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '2%',
            right: recallIconsRight,
            height: '8.5%',
            width: '9.5%',
            display: 'flex',
            alignItems: 'center',
            direction: 'ltr',
          }}
        >
          <ButtonBase
            disableRipple
            key="toggle-matching"
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              this.getMatchingFishSet(e as React.MouseEvent, true)
            }
            aria-label={I18n.t('switchToMatchingItems')}
            sx={{
              ...TOGGLE_BASE_SX,
              ...matchingBg,
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <FontAwesomeIcon
              icon={faCheck}
              style={{width: '100%', height: '100%'}}
            />
          </ButtonBase>
          <ButtonBase
            disableRipple
            key="toggle-non-matching"
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              this.getMatchingFishSet(e as React.MouseEvent, false)
            }
            aria-label={I18n.t('switchToNonMatchingItems')}
            sx={{
              ...TOGGLE_BASE_SX,
              ...nonMatchingBg,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
            }}
          >
            <FontAwesomeIcon
              icon={faBan}
              style={{width: '100%', height: '100%'}}
            />
          </ButtonBase>
        </Box>
        {showInfoButton && (
          <ButtonBase
            disableRipple
            id="uitest-info-btn"
            aria-label={I18n.t('fishInformation')}
            aria-pressed={state.pondPanelShowing ? 'true' : 'false'}
            sx={{
              position: 'absolute',
              top: '2%',
              right: '1.2%',
              cursor: 'pointer',
              borderRadius: '50px',
              padding: '0.75% 1.2%',
              fontSize: '120%',
              backgroundColor: state.pondPanelShowing
                ? 'var(--ocean-color-teal)'
                : 'var(--ocean-color-white)',
              color: state.pondPanelShowing
                ? 'var(--ocean-color-white)'
                : 'var(--ocean-color-grey)',
              height: '6%',
              width: '2.5%',
              border: 'none',
              '&:hover, &:focus': {
                backgroundColor: 'var(--ocean-color-teal)',
                color: 'var(--ocean-color-white)',
              },
            }}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              this.onPondPanelButtonClick(e as React.MouseEvent)
            }
          >
            <FontAwesomeIcon
              icon={faInfo}
              style={{display: 'block', margin: 'auto', height: '100%'}}
              aria-hidden
            />
          </ButtonBase>
        )}
        <img className="ocean-pond__bot" src={aiBotClosed} alt="" />
        {state.canSkipPond && (
          <Box id="uitest-nav-btns">
            {state.appMode === AppMode.FishLong ? (
              <Box>
                <Button
                  sx={{
                    backgroundColor: 'var(--ocean-color-yellow-green)',
                    color: 'var(--ocean-color-white)',
                    position: 'absolute',
                    bottom: '13.5%',
                    right: '1.2%',
                  }}
                  onClick={() => {
                    setState({pondClickedFish: null, pondPanelShowing: false});
                    helpers.resetTraining(state);
                    modeHelpers.toMode(Modes.Words);
                  }}
                >
                  {I18n.t('newWord')}
                </Button>
                <Button
                  sx={{
                    backgroundColor: 'var(--ocean-color-orange)',
                    color: 'var(--ocean-color-white)',
                    position: 'absolute',
                    bottom: '2%',
                    right: '1.2%',
                  }}
                  onClick={state.onContinue}
                >
                  {I18n.t('finish')}
                </Button>
              </Box>
            ) : (
              <Button
                sx={{
                  position: 'absolute',
                  bottom: '2%',
                  right: '1.2%',
                  backgroundColor: 'var(--ocean-color-orange)',
                  color: 'var(--ocean-color-white)',
                }}
                onClick={state.onContinue}
              >
                {I18n.t('continue')}
              </Button>
            )}
            <Box>
              <Button
                sx={{position: 'absolute', bottom: '2%', left: '1.2%'}}
                onClick={() => {
                  modeHelpers.toMode(Modes.Training);
                  setState({pondClickedFish: null, pondPanelShowing: false});
                }}
              >
                {I18n.t('trainMore')}
              </Button>
            </Box>
          </Box>
        )}
        {state.pondPanelShowing && <PondPanel />}
      </Body>
    );
  }
}
export default Pond;
