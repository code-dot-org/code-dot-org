import classNames from 'classnames';
import {connect} from 'react-redux';
import React, {PropTypes} from 'react';
import Radium from 'radium';
import commonStyles from '../commonStyles';
import color from "../util/color";
import {singleton as studioApp} from '../StudioApp';
import project from '../code-studio/initApp/project';
import VisualizationOverlay from '../templates/VisualizationOverlay';
import {VISUALIZATION_DIV_ID, isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import * as applabConstants from './constants';
import AppLabCrosshairOverlay from './AppLabCrosshairOverlay';
import AppLabTooltipOverlay from './AppLabTooltipOverlay';
import MakerStatusOverlay from '../lib/kits/maker/ui/MakerStatusOverlay';

const styles = {
  nonResponsive: {
    width: applabConstants.APP_WIDTH,
    height: applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT
  },
  share: {
    // overrides nonReponsive
    height: applabConstants.APP_HEIGHT
  },
  phoneFrame: {
    marginBottom: 0,
    borderColor: color.lighter_gray
  },
  phoneFrameRunning: {
    borderColor: color.charcoal
  },
  screenBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: applabConstants.APP_WIDTH,
    height: applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT,
    overflow: 'hidden',
    // layer 1 is design mode/div applab
    // layer 2 is items being dragged out from toolbox
    // layer 3 is cross-hair overlay
    // layer 4 is this
    zIndex: 4,
    position: 'absolute',
    top: 0,
    left: 0
  }
};

class Visualization extends React.Component {
  static propTypes = {
    visualizationHasPadding: PropTypes.bool.isRequired,
    isShareView: PropTypes.bool.isRequired,
    isPaused: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    playspacePhoneFrame: PropTypes.bool.isRequired,
    isResponsive: PropTypes.bool.isRequired
  };

  handleDisableMaker = () => project.toggleMakerEnabled();

  handleTryAgain = () => {
    studioApp().resetButtonClick();
    studioApp().runButtonClick();
  };

  render() {
    const appWidth = applabConstants.APP_WIDTH;
    const appHeight = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;

    return (
      <div
        id={VISUALIZATION_DIV_ID}
        className={classNames({
          responsive: this.props.isResponsive,
          with_padding: this.props.visualizationHasPadding
        })}
        style={[
          !this.props.isResponsive && styles.nonResponsive,
          this.props.isShareView && styles.share,
          this.props.playspacePhoneFrame && styles.phoneFrame,
          this.props.playspacePhoneFrame && this.props.isRunning && styles.phoneFrameRunning
        ]}
      >
        <div
          id="divApplab"
          className="appModern"
          tabIndex="1"
        />
        <div
          id="designModeViz"
          className="appModern"
          tabIndex="1"
          style={commonStyles.hidden}
        />
        <VisualizationOverlay width={appWidth} height={appHeight}>
          <AppLabCrosshairOverlay/>
          <AppLabTooltipOverlay/>
        </VisualizationOverlay>
        <MakerStatusOverlay
          width={appWidth}
          height={appHeight}
          handleDisableMaker={this.handleDisableMaker}
          handleTryAgain={this.handleTryAgain}
        />
        <div
          style={[
            styles.screenBlock,
            !(this.props.isPaused && this.props.playspacePhoneFrame) && commonStyles.hidden
          ]}
        />
      </div>
    );
  }
}

export default connect(state => ({
  visualizationHasPadding: state.pageConstants.visualizationHasPadding,
  isShareView: state.pageConstants.isShareView,
  isRunning: state.runState.isRunning,
  isPaused: state.runState.isDebuggerPaused,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame,
  isResponsive: isResponsiveFromState(state)
}))(Radium(Visualization));
