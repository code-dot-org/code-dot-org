/** @file Start Over button used in crypto widget */
import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import Dialog from '../templates/Dialog';

const StartOverButton = React.createClass({
  propTypes: {
    onClick: PropTypes.func.isRequired
  },

  getInitialState() {
    return {confirming: false};
  },

  confirm() {
    this.setState({confirming: true});
  },

  onConfirm() {
    this.props.onClick();
    this.setState({confirming: false});
  },

  onCancel() {
    this.setState({confirming: false});
  },

  render() {
    return (
      <span>
        <button
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
      </span>);
  }
});
export default StartOverButton;
