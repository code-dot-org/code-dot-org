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
      return { isOpen: true };
    },

    componentWillReceiveProps: function (newProps) {
      this.setState({isOpen: true});
    },

    close: function () {
      this.setState({isOpen: false});
    },

    render: function () {
      // TODO - Can we now make SendToPhone completely Reactified?
      return (
        <Dialog isOpen={this.state.isOpen} handleClose={this.close}>
          <Pairing sections={this.props.sections} pairings={this.props.pairings}/>
        </Dialog>
      );
    }
  });
})(React);
