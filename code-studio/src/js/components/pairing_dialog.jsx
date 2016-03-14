/**
 * Pair Programming dialog
 */

/* global React, dashboard */

var Pairing = require('./pairing.jsx'); /* all the interesting stuff is here btw */
var Dialog = require('./dialog.jsx');

console.log(Pairing);

var PairingDialog = React.createClass({
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

module.exports = PairingDialog;

window.dashboard = window.dashboard || {};
window.dashboard.PairingDialog = PairingDialog;
