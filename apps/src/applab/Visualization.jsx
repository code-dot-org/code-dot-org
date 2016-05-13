var Radium = require('radium');
var applabConstants = require('./constants');
var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var connect = require('react-redux').connect;
var experiments = require('../experiments');
var classNames = require('classnames');
import VisualizationOverlay from '../templates/VisualizationOverlay';
import AppLabCrosshairOverlay from './AppLabCrosshairOverlay';
import AppLabTooltipOverlay from './AppLabTooltipOverlay';

var styles = {
  nonResponsive: {
    width: applabConstants.APP_WIDTH,
    height: applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT
  },
  share: {
    // overrides nonReponsive
    height: applabConstants.APP_HEIGHT
  },
  phoneFrame: {
    marginBottom: 0
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

var Visualization = React.createClass({
  propTypes: {
    visualizationHasPadding: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    isPaused: React.PropTypes.bool.isRequired,
    playspacePhoneFrame: React.PropTypes.bool.isRequired
  },

  render: function () {
    var appWidth = applabConstants.APP_WIDTH;
    var appHeight = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;

    return (
      <div id="visualization"
          className={classNames({with_padding: this.props.visualizationHasPadding})}
          style={[
            (this.props.isEmbedView || this.props.hideSource) && styles.nonResponsive,
            this.props.isShareView && styles.share,
            this.props.playspacePhoneFrame && styles.phoneFrame
          ]}
      >
        <div id="divApplab" className="appModern" tabIndex="1"/>
        <div id="designModeViz" className="appModern" style={commonStyles.hidden}/>
        <VisualizationOverlay width={appWidth} height={appHeight}>
          <AppLabCrosshairOverlay/>
          <AppLabTooltipOverlay/>
        </VisualizationOverlay>
        <div style={[
            styles.screenBlock,
            !(this.props.isPaused && this.props.playspacePhoneFrame) && commonStyles.hidden
          ]}
        />
      </div>
    );
  }
});

module.exports = connect(function propsFromStore(state) {
  return {
    visualizationHasPadding: state.pageConstants.visualizationHasPadding,
    hideSource: state.pageConstants.hideSource,
    isEmbedView: state.pageConstants.isEmbedView,
    isShareView: state.pageConstants.isShareView,
    isPaused: state.runState.isDebuggerPaused,
    playspacePhoneFrame: state.pageConstants.playspacePhoneFrame
  };
})(Radium(Visualization));
