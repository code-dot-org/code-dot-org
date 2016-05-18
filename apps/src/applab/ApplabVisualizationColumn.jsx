import GameButtons, {ResetButton} from '../templates/GameButtons';

var Radium = require('radium');
var studioApp = require('../StudioApp').singleton;
var Visualization = require('./Visualization');
var CompletionButton = require('./CompletionButton');
var PlaySpaceHeader = require('./PlaySpaceHeader');
var PhoneFrame = require('./PhoneFrame');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
var applabConstants = require('./constants');
var connect = require('react-redux').connect;
var classNames = require('classnames');
var experiments = require('../experiments');

var styles = {
  nonResponsive: {
    maxWidth: applabConstants.APP_WIDTH,
  },
  completion: {
    display: 'inline'
  },
  phoneFrameCompletion: {
    display: 'block',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center'
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 68,
    left: 16,
    width: applabConstants.APP_WIDTH,
    height: applabConstants.APP_HEIGHT,
    zIndex: 5,
    textAlign: 'center',
    cursor: 'pointer',
  },
  playButton: {
    color: 'white',
    fontSize: 200,
    lineHeight: applabConstants.APP_HEIGHT+'px',
  },
  resetButtonWrapper: {
    position: 'absolute',
    bottom: 5,
    textAlign: 'center',
    width: '100%',
  },
};

var IframeOverlay = Radium(function (props) {
  return (
    <div style={[styles.overlay]} onClick={() => studioApp.startIFrameEmbeddedApp()}>
      <span className="fa fa-play" style={[styles.playButton]} />
    </div>
  );
});

/**
 * Equivalent of visualizationColumn.html.ejs. Initially only supporting
 * portions used by App Lab
 */
var ApplabVisualizationColumn = React.createClass({
  propTypes: {
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    instructionsInTopPane: React.PropTypes.bool.isRequired,
    visualizationHasPadding: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    isResponsive: React.PropTypes.bool.isRequired,
    isRunning: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes.string.isRequired,
    playspacePhoneFrame: React.PropTypes.bool,
    isIframeEmbed: React.PropTypes.bool.isRequired,

    // non redux backed
    isEditingProject: React.PropTypes.bool.isRequired,
    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
  },

  render: function () {
    let visualization = [
      <Visualization key="1"/>,
      this.props.isIframeEmbed && !this.props.isRunning && <IframeOverlay key="2"/>
    ];
    // Share view still uses image for phone frame. Would eventually like it to
    // use same code
    if (this.props.playspacePhoneFrame) {
      // wrap our visualization in a phone frame
      visualization = (
        <PhoneFrame
            isDark={this.props.isRunning}
            showSelector={!this.props.isRunning}
            isPaused={this.props.isPaused}
            screenIds={this.props.screenIds}
            onScreenCreate={this.props.onScreenCreate}
        >
          {visualization}
        </PhoneFrame>
      );
    }

    const visualizationColumnClassNames = classNames({
      with_padding: this.props.visualizationHasPadding,
      responsive: this.props.isResponsive
    });

    return (
      <div
          id="visualizationColumn"
          className={visualizationColumnClassNames}
          style={[!this.props.isResponsive && styles.nonResponsive]}
      >
        {!this.props.isReadOnlyWorkspace && <PlaySpaceHeader
            isEditingProject={this.props.isEditingProject}
            screenIds={this.props.screenIds}
            onScreenCreate={this.props.onScreenCreate} />
        }
        {visualization}
        {this.props.isIframeEmbed &&
         <div style={styles.resetButtonWrapper}>
           <ResetButton/>
         </div>
        }
        <GameButtons>
          {/* This div is used to control whether or not our finish button is centered*/}
          <div style={[
              styles.completion,
              this.props.playspacePhoneFrame && styles.phoneFrameCompletion
            ]}
          >
            <CompletionButton/>
          </div>
        </GameButtons>
        <BelowVisualization instructionsInTopPane={this.props.instructionsInTopPane}/>
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    instructionsInTopPane: state.pageConstants.instructionsInTopPane,
    visualizationHasPadding: state.pageConstants.visualizationHasPadding,
    isShareView: state.pageConstants.isShareView,
    isResponsive: isResponsiveFromState(state),
    isIframeEmbed: state.pageConstants.isIframeEmbed,
    isRunning: state.runState.isRunning,
    isPaused: state.runState.isDebuggerPaused,
    interfaceMode: state.interfaceMode,
    playspacePhoneFrame: state.pageConstants.playspacePhoneFrame
  };
})(Radium(ApplabVisualizationColumn));
