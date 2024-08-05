/** @file Start Over button used in crypto widget */
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import Dialog from '../templates/Dialog';

export default class StartOverButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
  };

  state = {confirming: false};

  confirm = () => this.setState({confirming: true});

  onConfirm = () => {
    this.props.onClick();
    this.setState({confirming: false});
  };

  onCancel = () => this.setState({confirming: false});

  render() {
    return (
      <span>
        <button
          type="button"
          className="btn btn-info pull-right"
          onClick={this.confirm}
        >
          {i18n.clearPuzzle()}
        </button>
        <Dialog
          isOpen={this.state.confirming}
          uncloseable
          title={i18n.clearPuzzle()}
          body={i18n.clearPuzzleConfirmHeader()}
          onConfirm={this.onConfirm}
          onCancel={this.onCancel}
        />
      </span>
    );
  }
}
