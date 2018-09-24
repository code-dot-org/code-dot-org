import classNames from 'classnames';
import {connect} from 'react-redux';
import React, {PropTypes} from 'react';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import {GAME_WIDTH} from './constants';
import GameLabVisualizationColumn from './GameLabVisualizationColumn';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import CodeWorkspace from '../templates/CodeWorkspace';
import VisualizationResizeBar from "../lib/ui/VisualizationResizeBar";

/**
 * Top-level React wrapper for GameLab
 */
class GameLabView extends React.Component {
  static propTypes = {
    // Provided manually
    showFinishButton: PropTypes.bool.isRequired,
    onMount: PropTypes.func.isRequired,
    danceLab: PropTypes.bool.isRequired,
    // Provided by Redux
    isResponsive: PropTypes.bool.isRequired,
    hideSource: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    spriteLab: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this.props.onMount();
  }

  renderCodeMode() {
    const {isResponsive, hideSource, pinWorkspaceToBottom,
           showFinishButton} = this.props;

    const visualizationColumnStyle = {
      width: GAME_WIDTH
    };

    const visualizationColumnClassNames = classNames({
      responsive: isResponsive,
      pin_bottom: !hideSource && pinWorkspaceToBottom
    });

    return (
      <div>
        <div
          id="visualizationColumn"
          className={visualizationColumnClassNames}
          style={visualizationColumnStyle}
        >
          <GameLabVisualizationColumn finishButton={showFinishButton} danceLab={this.props.danceLab}/>
        </div>
        <VisualizationResizeBar/>
        <InstructionsWithWorkspace>
          <CodeWorkspace />
        </InstructionsWithWorkspace>
      </div>
    );
  }

  render() {
    return (
      <StudioAppWrapper>
        {this.renderCodeMode()}
      </StudioAppWrapper>
    );
  }
}
export default connect(state => ({
  hideSource: state.pageConstants.hideSource,
  isResponsive: isResponsiveFromState(state),
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
  isRunning: state.runState.isRunning,
  spriteLab: state.pageConstants.isBlockly,
}))(GameLabView);
