require('./pairing.jsx');
require('./dialog.jsx');

window.dashboard = window.dashboard || {};

/**
 * Pair Programming dialog
 */
window.dashboard.PairingDialog = (function (React) {
  var Dialog = window.dashboard.Dialog;
  var Pairing = window.dashboard.Pairing;

  return React.createClass({
    getInitialState: function () {
      return { isOpen: false };
    },

    close: function () {
      this.setState({isOpen: false});
    },

    open: function () {
      this.setState({isOpen: true});
    },

    render: function () {
      return (
        <Dialog isOpen={this.state.isOpen} handleClose={this.close}>
          <Pairing source={this.props.source} handleClose={this.close}/>
        </Dialog>
      );
    }
  });
})(React);
