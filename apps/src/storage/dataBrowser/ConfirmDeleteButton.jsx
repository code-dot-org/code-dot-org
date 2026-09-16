import Dialog from '@code-dot-org/component-library/dialog';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

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
    const confirmText = this.props.confirmText || msg.delete();
    return (
      <div style={{display: 'inline-block', ...this.props.containerStyle}}>
        {this.state.open && (
          <Dialog
            title={this.props.title}
            description={this.props.body}
            onClose={this.handleClose}
            closeLabel={msg.cancel()}
            primaryButtonProps={{
              children: confirmText,
              onClick: this.handleConfirm,
              color: 'error',
            }}
            secondaryButtonProps={{
              children: msg.cancel(),
              onClick: this.handleClose,
            }}
          />
        )}
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
