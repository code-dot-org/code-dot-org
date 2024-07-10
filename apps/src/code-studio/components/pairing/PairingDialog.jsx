import PropTypes from 'prop-types';
import React from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';

import Pairing from './Pairing.jsx';

/**
 * Pair programming dialog.
 */
export default class PairingDialog extends React.Component {
  static propTypes = {
    source: PropTypes.string,
  };

  state = {isOpen: false};

  close = () => this.setState({isOpen: false});

  open = () => this.setState({isOpen: true});

  render() {
    return (
      <BaseDialog isOpen={this.state.isOpen} handleClose={this.close}>
        <Pairing source={this.props.source} handleClose={this.close} />
      </BaseDialog>
    );
  }
}
