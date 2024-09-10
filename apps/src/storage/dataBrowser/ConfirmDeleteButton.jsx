import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import Dialog from '../../legacySharedComponents/Dialog';

import dataStyles from './data-styles.module.scss';

class ConfirmDeleteButton extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    buttonId: PropTypes.string,
    buttonText: PropTypes.string.isRequired,
    confirmText: PropTypes.string,
    containerStyle: PropTypes.any,
    onConfirmDelete: PropTypes.func.isRequired,
  };

  state = {
    open: false,
  };

  handleClose = () => this.setState({open: false});

  handleConfirm = () => {
    this.setState({open: false});
    this.props.onConfirmDelete();
  };

  render() {
    let {confirmText, ...otherProps} = this.props;
    confirmText = confirmText || msg.delete();
    return (
      <div style={{...{display: 'inline-block'}, ...this.props.containerStyle}}>
        <Dialog
          cancelText={msg.cancel()}
          confirmText={confirmText}
          confirmType="danger"
          isOpen={!!this.state && this.state.open}
          handleClose={this.handleClose}
          onCancel={this.handleClose}
          onConfirm={this.handleConfirm}
          {...otherProps}
        />
        <button
          type="button"
          id={this.props.buttonId}
          onClick={() => this.setState({open: true})}
          className={classNames(dataStyles.button, dataStyles.buttonRed)}
        >
          {this.props.buttonText}
        </button>
      </div>
    );
  }
}

export default ConfirmDeleteButton;
