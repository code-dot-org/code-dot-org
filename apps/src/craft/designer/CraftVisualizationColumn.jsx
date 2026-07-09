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
import {default as GameButtons} from '../../templates/GameButtons';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';
import craftMsg from '../locale';
import minecraftMuiTheme from '../minecraftMuiTheme';

export default class CraftVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    showScore: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <span>
        <ProtectedVisualizationDiv>
          <div id="minecraft-frame">
            <SwipePrompt useMinecraftStyling />
            <div id="phaser-game" />
            {this.props.showScore && (
              <div id="score-container">
                <div id="score-inner">
                  <span>{craftMsg.score()}: </span>
                  <span id="score-number">0</span>
                </div>
              </div>
            )}
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

            {this.props.showFinishButton && (
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
  }
}
