/* global dashboard */

import React from 'react';

import Pairing from './pairing.jsx';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

/**
 * Pair programming dialog.
 */
var PairingDialog = React.createClass({
  propTypes: {
    source: React.PropTypes.string
  },

  getInitialState() {
    return {isOpen: false};
  },

  close() {
    this.setState({isOpen: false});
  },

  open() {
    this.setState({isOpen: true});
  },

  render() {
    return (
      <BaseDialog isOpen={this.state.isOpen} handleClose={this.close}>
        <Pairing source={this.props.source} handleClose={this.close} />
      </BaseDialog>
    );
  }
});
export default PairingDialog;
