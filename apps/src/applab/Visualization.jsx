import classNames from 'classnames';
import {connect} from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import commonStyles from '../commonStyles';
import color from '../util/color';
import {singleton as studioApp} from '../StudioApp';
import project from '../code-studio/initApp/project';
import VisualizationOverlay from '../templates/VisualizationOverlay';
import {
  VISUALIZATION_DIV_ID,
  isResponsiveFromState
} from '../templates/ProtectedVisualizationDiv';
import * as applabConstants from './constants';
import AppLabCrosshairOverlay from './AppLabCrosshairOverlay';
import AppLabTooltipOverlay from './AppLabTooltipOverlay';
import MakerStatusOverlay from '../lib/kits/maker/ui/MakerStatusOverlay';

const styles = {
  nonResponsive: {
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
    isResponsive: PropTypes.bool.isRequired,
    widgetMode: PropTypes.bool
  };

  state = {
    appWidth: this.props.widgetMode
      ? applabConstants.WIDGET_WIDTH
      : applabConstants.APP_WIDTH
  };

  handleDisableMaker = () => project.setMakerEnabled(null);

  handleTryAgain = () => {
    studioApp().resetButtonClick();
    studioApp().runButtonClick();
  };

  render() {
    const {appWidth} = this.state;
    const appHeight =
      applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;

    return (
      <div
        id={VISUALIZATION_DIV_ID}
        className={
          this.props.widgetMode
            ? 'widgetWidth widgetHeight'
            : classNames({
                responsive: this.props.isResponsive,
                with_padding: this.props.visualizationHasPadding
              })
        }
        style={[
          !this.props.isResponsive && {
            ...styles.nonResponsive,
            ...{width: appWidth}
          },
          this.props.isShareView && styles.share,
          this.props.playspacePhoneFrame && styles.phoneFrame,
          this.props.playspacePhoneFrame &&
            this.props.isRunning &&
            styles.phoneFrameRunning
        ]}
      >
        <div id="divApplab" className="appModern" tabIndex="1" />
        <div
          id="designModeViz"
          className="appModern"
          tabIndex="1"
          style={commonStyles.hidden}
        />
        <VisualizationOverlay width={appWidth} height={appHeight}>
          <AppLabCrosshairOverlay />
          <AppLabTooltipOverlay />
        </VisualizationOverlay>
        <MakerStatusOverlay
          width={appWidth}
          height={appHeight}
          handleDisableMaker={this.handleDisableMaker}
          handleTryAgain={this.handleTryAgain}
        />
        <div
          style={[
            {...styles.screenBlock, ...{width: appWidth}},
            !(this.props.isPaused && this.props.playspacePhoneFrame) &&
              commonStyles.hidden
          ]}
        />
      </div>
    );
  }
}

export const UnconnectedVisualization = Visualization;

export default connect(state => ({
  visualizationHasPadding: state.pageConstants.visualizationHasPadding,
  isShareView: state.pageConstants.isShareView,
  isRunning: state.runState.isRunning,
  isPaused: state.runState.isDebuggerPaused,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame,
  isResponsive: isResponsiveFromState(state),
  widgetMode: state.pageConstants.widgetMode
}))(Radium(Visualization));
