var ShareWarnings = require('./ShareWarnings.jsx');

/**
 * Modal for our SharingWarnings.
 */
var SharingWarningsDialog = module.exports = React.createClass({
  propTypes: {
    signedIn: React.PropTypes.bool.isRequired,
    storesData: React.PropTypes.bool.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    handleTooYoung: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { modalIsOpen: !this.props.signedIn || this.props.storesData };
  },

  componentDidMount: function () {
    // We didn't need to show our modal. Go through the close process so that
    // app becomes unblocked
    if (!this.state.modalIsOpen) {
      this.handleClose();
    }
  },

  handleClose: function() {
    this.setState({modalIsOpen: false});
    React.unmountComponentAtNode(this.getDOMNode().parentNode);
    this.props.handleClose();
  },

  render: function () {
    if (!this.state.modalIsOpen) {
      return <div/>;
    }

    var styles = {
      main: {
        margin: '10px 0px 10px 10px',
        position: 'absolute',
        top: 50,
        // TODO - centering doesnt look quite right yet on mobile
        left: '50%',
        transform: 'translate(-50%, 0)',
        border: '1px solid #ccc',
        background: '#fff',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        zIndex: 1050,
      },
      overlay: {
        position: 'fixed',
        opacity: 0.8,
        backgroundColor: 'black',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1040
      }
    };

    return (
      <div>
        <div style={styles.overlay}/>
        <div style={styles.main}>
          <ShareWarnings
            signedIn={this.props.signedIn}
            storesData={this.props.storesData}
            handleTooYoung={this.props.handleTooYoung}
            handleClose={this.handleClose}/>
        </div>
      </div>
    );
  }
});
