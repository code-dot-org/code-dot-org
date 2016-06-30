/* global dashboard */

import React from 'react';

import Pairing from './pairing.jsx';
import Dialog from '@cdo/apps/templates/DialogComponent';

/**
 * Pair programming dialog.
 */
var PairingDialog = React.createClass({
  propTypes: {
    initialIsOpen: React.PropTypes.bool.isRequired,
    source: React.PropTypes.string
  },

  getInitialState() {
    return {isOpen: this.props.initialIsOpen};
  },

  close() {
    this.setState({isOpen: false});
  },

  open() {
    this.setState({isOpen: true});
  },

  render() {
    return (
      <Dialog isOpen={this.state.isOpen} handleClose={this.close}>
        <Pairing source={this.props.source} handleClose={this.close} />
      </Dialog>
    );
  }
});

export default PairingDialog;

window.dashboard = window.dashboard || {};
window.dashboard.PairingDialog = PairingDialog;
