import {faBan, faCheck, faInfo} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Box, IconButton} from '@mui/material';
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
import {
  cornerIconButtonBaseSx,
  orangeCornerButtonSx,
  srOnlySx,
} from '@/oceans/styles/layout';
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
  if (
    x1 + w1 - 1 < x2 ||
    x1 > x2 + w2 - 1 ||
    y1 + h1 - 1 < y2 ||
    y1 > y2 + h2 - 1
  ) {
    return false;
  }
  return true;
}

/**
 * Base sx shared by both toggle-icon (recall) buttons.
 * Uses Box component="button" (not IconButton) so MUI adds no extra sizing,
 * min-width, overflow, or theme overrides — matching the original <button>.
 */
const toggleBaseSx = {
  cursor: 'pointer',
  height: '100%',
  width: '50%',
  backgroundColor: 'var(--ocean-color-white)',
  color: 'var(--ocean-color-grey)',
  border: 'none',
  padding: '12%',
  display: 'flex',
  margin: 0,
  borderRadius: 0,
  '&:focus-visible': {position: 'relative', zIndex: 1},
};

class Pond extends React.Component {
  constructor(props: Record<string, never>) {
    super(props);
  }

  getMatchingFishSet = (e: React.MouseEvent | null, showMatching: boolean) => {
    const state = getState();

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

    if (nextFishSet.length > 0 && !nextFishSet[0].getXY?.()) {
      arrangeFish(nextFishSet as unknown as Parameters<typeof arrangeFish>[0]);
    }

    if (currentFishSet.length === 0) {
      setState({showRecallFish: !state.showRecallFish, pondClickedFish: null});
    } else {
      setState({pondFishTransitionStartTime: $time(), pondClickedFish: null});
    }

    if (e) {
      e.stopPropagation();
    }
  };

  onPondClick = (e: React.MouseEvent) => {
    if (guide.getCurrentGuide()) {
      return;
    }

    const state = getState();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

    const boundingRect = (e.target as HTMLElement).getBoundingClientRect();
    const pondWidth = boundingRect.width;
    const pondHeight = boundingRect.height;

    const normalizedClickX = (clickX / pondWidth) * constants.canvasWidth;
    const normalizedClickY = (clickY / pondHeight) * constants.canvasHeight;

    const fishCollection = state.showRecallFish
      ? state.recallFish
      : state.pondFish;

    if (state.pondFishBounds) {
      let fishClicked = false;
      _.reverse(state.pondFishBounds).forEach(fishBound => {
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

    return (
      <Body>
        {/* Screen-reader announcement for fish selection changes. */}
        <Box role="status" aria-live="polite" aria-atomic="true" sx={srOnlySx}>
          {state.pondClickedFish ? 'Fish selected' : ''}
        </Box>

        {/* Canvas surface — the fish animation renders here via imperative renderer */}
        <Box
          role="button"
          aria-label="Fish pond"
          tabIndex={0}
          onClick={this.onPondClick}
          onKeyDown={e => {
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

        {/* Recall-mode toggle (matching / non-matching) */}
        <Box
          sx={[
            {
              position: 'absolute',
              top: '2%',
              height: '8.5%',
              width: '9.5%',
              display: 'flex',
              alignItems: 'center',
              direction: 'ltr',
            },
            showInfoButton ? {right: '7%'} : {right: '1.2%'},
          ]}
        >
          <Box
            component="button"
            type="button"
            key="toggle-matching"
            onClick={(e: React.MouseEvent) => this.getMatchingFishSet(e, true)}
            aria-label={I18n.t('switchToMatchingItems')}
            aria-pressed={!state.showRecallFish}
            sx={[
              toggleBaseSx,
              {
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
              },
              !state.showRecallFish
                ? {
                    backgroundColor: 'var(--ocean-color-green)',
                    color: 'var(--ocean-color-white)',
                  }
                : {},
            ]}
          >
            <FontAwesomeIcon
              icon={faCheck}
              style={{width: '100%', height: '100%'}}
            />
          </Box>
          <Box
            component="button"
            type="button"
            key="toggle-non-matching"
            onClick={(e: React.MouseEvent) => this.getMatchingFishSet(e, false)}
            aria-label={I18n.t('switchToNonMatchingItems')}
            aria-pressed={state.showRecallFish}
            sx={[
              toggleBaseSx,
              {
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
              },
              state.showRecallFish
                ? {
                    backgroundColor: 'var(--ocean-color-red)',
                    color: 'var(--ocean-color-white)',
                  }
                : {},
            ]}
          >
            <FontAwesomeIcon
              icon={faBan}
              style={{width: '100%', height: '100%'}}
            />
          </Box>
        </Box>

        {/* Info icon button */}
        {showInfoButton && (
          <IconButton
            id="uitest-info-btn"
            aria-label={I18n.t('fishInformation')}
            aria-pressed={state.pondPanelShowing}
            onClick={this.onPondPanelButtonClick}
            sx={[
              cornerIconButtonBaseSx,
              {
                width: '2.5%',
                '&:hover, &:focus-visible': {
                  backgroundColor: 'var(--ocean-color-teal)',
                  color: 'var(--ocean-color-white)',
                },
              },
              state.pondPanelShowing
                ? {
                    backgroundColor: 'var(--ocean-color-teal)',
                    color: 'var(--ocean-color-white)',
                  }
                : {},
            ]}
          >
            <FontAwesomeIcon
              icon={faInfo}
              style={{display: 'block', margin: 'auto', height: '100%'}}
              aria-hidden
            />
          </IconButton>
        )}

        {/* AI bot image */}
        <Box
          component="img"
          src={aiBotClosed}
          alt=""
          sx={{
            position: 'absolute',
            height: '27%',
            top: '59%',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-45%)',
            pointerEvents: 'none',
          }}
        />

        {/* Navigation buttons when the user can skip the pond scene */}
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
                    '&:hover': {
                      backgroundColor: 'var(--ocean-color-yellow-green)',
                    },
                  }}
                  onClick={() => {
                    setState({pondClickedFish: null, pondPanelShowing: false});
                    helpers.resetTraining(state);
                    modeHelpers.toMode(Modes.Words);
                  }}
                >
                  {I18n.t('newWord')}
                </Button>
                <Button sx={orangeCornerButtonSx} onClick={state.onContinue}>
                  {I18n.t('finish')}
                </Button>
              </Box>
            ) : (
              <Button sx={orangeCornerButtonSx} onClick={state.onContinue}>
                {I18n.t('continue')}
              </Button>
            )}
            <Box>
              <Button
                sx={{
                  position: 'absolute',
                  bottom: '2%',
                  left: '1.2%',
                }}
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
