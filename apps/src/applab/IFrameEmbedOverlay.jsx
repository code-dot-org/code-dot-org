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
    ageWarning: {
      backgroundColor: 'pink',
      color: 'red',
      padding: 10,
      width: '90%',
      borderColor: 'red',
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 5,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 5,
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
          <div style={styles.overlay.ageWarning}>
            This content has age restrictions in place and is not available for younger students
          </div> :
          <span className="fa fa-play" style={styles.playButton} />
        }
      </div>
    );
  },
});

export default Radium(IFrameEmbedOverlay);
