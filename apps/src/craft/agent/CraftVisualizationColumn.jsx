import {Button as MuiButton} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
import PropTypes from 'prop-types';
import React from 'react';

import SwipePrompt from '@cdo/apps/templates/SwipePrompt';
import msg from '@cdo/locale';

import downArrowImg from '../../../static/craft/Sliced_Parts/MC_Down_Arrow_Icon.png';
import resetButtonImg from '../../../static/craft/Sliced_Parts/MC_Reset_Arrow_Icon.png';
import runButtonImg from '../../../static/craft/Sliced_Parts/MC_Run_Arrow_Icon_Smaller.png';
import upArrowImg from '../../../static/craft/Sliced_Parts/MC_Up_Arrow_Icon.png';
import ArrowButtons from '../../templates/ArrowButtons';
import BelowVisualization from '../../templates/BelowVisualization';
import GameButtons from '../../templates/GameButtons';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';
import minecraftMuiTheme from '../minecraftMuiTheme';

const CraftVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <div id="minecraft-frame">
          <SwipePrompt useMinecraftStyling />
          <div id="phaser-game" />
        </div>
      </ProtectedVisualizationDiv>
      <ThemeProvider theme={minecraftMuiTheme}>
        <GameButtons
          runButtonIcon={
            <img
              alt=""
              style={{imageRendering: 'pixelated', padding: '.25rem'}}
              src={runButtonImg}
            />
          }
          resetButtonIcon={
            <img
              alt=""
              style={{imageRendering: 'pixelated'}}
              src={resetButtonImg}
            />
          }
        >
          <ArrowButtons
            downIcon={<img src={downArrowImg} alt="" />}
            leftIcon={
              <img
                style={{transform: 'scaleX(-1)'}}
                src={runButtonImg}
                alt=""
              />
            }
            rightIcon={<img src={runButtonImg} alt="" />}
            upIcon={<img src={upArrowImg} alt="" />}
          />

          {props.showFinishButton && (
            <div id="right-button-cell">
              <MuiButton
                id="rightButton"
                variant="outlined"
                color="secondary"
                size="medium"
                className="share mc-share-button"
              >
                <div>{msg.finish()}</div>
              </MuiButton>
            </div>
          )}
        </GameButtons>
      </ThemeProvider>
      <BelowVisualization />
    </span>
  );
};

CraftVisualizationColumn.propTypes = {
  showFinishButton: PropTypes.bool.isRequired,
};

export default CraftVisualizationColumn;
