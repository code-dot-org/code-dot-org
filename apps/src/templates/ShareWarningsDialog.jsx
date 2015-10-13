var ShareWarnings = require('./ShareWarnings');

var SharingWarningsDialog = module.exports = React.createClass({
  getInitialState: function() {
    return { modalIsOpen: true };
  },

  handleClose: function() {
    this.setState({modalIsOpen: false});
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
        // TODO - centering doesnt look quite right yet
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
      // TODO
      overlay: {
        position: 'fixed',
        opacity: 0.8,
        backgroundColor: 'black',

        // backgroundColor: 'rgba(256, 256, 256, 0.2)',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1040
      }
    };

    // TODO - properly set properties
    return (
      <div>
        <div style={styles.overlay}/>
        <div style={styles.main}>
          <ShareWarnings signedIn={true} storesData={true} handleClose={this.handleClose}/>
        </div>
      </div>
    );
  }
});
