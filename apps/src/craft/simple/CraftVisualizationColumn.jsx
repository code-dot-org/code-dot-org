import {Button as MuiButton} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import resetButtonImg from '../../../static/craft/Sliced_Parts/MC_Reset_Arrow_Icon.png';
import runButtonImg from '../../../static/craft/Sliced_Parts/MC_Run_Arrow_Icon_Smaller.png';
import BelowVisualization from '../../templates/BelowVisualization';
import GameButtons from '../../templates/GameButtons';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';
import minecraftMuiTheme from '../minecraftMuiTheme';

const CraftVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <div id="minecraft-frame">
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
