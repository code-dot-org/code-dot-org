var Radium = require('radium');
var studioApp = require('../StudioApp').singleton;
var applabConstants = require('./constants');
var msg = require('../locale');

var styles = {
  overlay: {
    wrapper: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: 'absolute',
      top: 68,
      left: 16,
      width: applabConstants.APP_WIDTH,
      height: applabConstants.APP_HEIGHT,
      zIndex: 5,
      textAlign: 'center',
    },
  },
  playButton: {
    color: 'white',
    fontSize: 200,
    lineHeight: applabConstants.APP_HEIGHT+'px',
  },
};

var IFrameEmbedOverlay = React.createClass({

  getDefaultState() {
    return {tooYoung: false};
  },

  handleTooYoung() {
    this.setState({tooYoung: true});
  },

  onClick() {
    if (!this.state.tooYoung) {
      studioApp.startIFrameEmbeddedApp(this.handleTooYoung);
    }
  },

  render() {
    return (
      <div style={[styles.overlay.wrapper, !this.state.tooYoung && {cursor: 'cursor'}]}
           onClick={this.onClick}>
        {
          this.state.tooYoung ?
          <div className="alert alert-danger">
            {window.dashboard.i18n.t('errors.messages.too_young')}
          </div> :
          <span className="fa fa-play" style={styles.playButton} />
        }
      </div>
    );
  },
});

export default Radium(IFrameEmbedOverlay);
