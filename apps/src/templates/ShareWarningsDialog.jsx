var color = require('../color');
var ShareWarnings = require('./ShareWarnings.jsx');

/**
 * Modal for our SharingWarnings.
 */
var SharingWarningsDialog = module.exports = React.createClass({
  propTypes: {
    is13Plus: React.PropTypes.bool.isRequired,
    showStoreDataAlert: React.PropTypes.bool.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    handleTooYoung: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {modalIsOpen: !this.props.is13Plus || this.props.showStoreDataAlert};
  },

  componentDidMount: function () {
    // We didn't need to show our modal. Go through the close process so that
    // app becomes unblocked
    if (!this.state.modalIsOpen) {
      this.handleClose();
    }
  },

  handleClose: function () {
    this.setState({modalIsOpen: false});
    this.props.handleClose();
  },

  render: function () {
    if (!this.state.modalIsOpen) {
      return <div/>;
    }

    var styles = {
      main: {
        position: 'absolute',
        top: 50,
        left: '50%',
        transform: 'translate(-50%, 0)',
        WebkitTransform: 'translate(-50%, 0)',
        border: '1px solid #ccc',
        background: '#fff',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        zIndex: 1050, // based off of behavior in dashboard's dialog.js
        width: window.screen.width < 500 ? '80%' : undefined
      },
      overlay: {
        position: 'fixed',
        opacity: 0.8,
        backgroundColor: color.black,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1040 // based off of behavior in dashboard's dialog.js
      }
    };

    return (
      <div>
        <div style={styles.overlay}/>
        <div style={styles.main}>
          <ShareWarnings
            is13Plus={this.props.is13Plus}
            showStoreDataAlert={this.props.showStoreDataAlert}
            handleTooYoung={this.props.handleTooYoung}
            handleClose={this.handleClose}/>
        </div>
      </div>
    );
  }
});
