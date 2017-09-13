import React, {PropTypes} from 'react';
import Radium from 'radium';
import Dialog from '../../templates/Dialog';
import * as dataStyles from './dataStyles';

const ConfirmDeleteButton = React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    buttonId: PropTypes.string,
    buttonText: PropTypes.string.isRequired,
    confirmText: PropTypes.string,
    containerStyle: PropTypes.any,
    onConfirmDelete: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      open: false
    };
  },

  handleClose() {
    this.setState({open: false});
  },

  handleConfirm() {
    this.setState({open: false});
    this.props.onConfirmDelete();
  },

  render() {
    let {confirmText, ...otherProps} = this.props;
    confirmText = confirmText || "Delete";
    return (
      <div style={[{display: 'inline-block'}, this.props.containerStyle]}>
        <Dialog
          cancelText="Cancel"
          confirmText={confirmText}
          confirmType="danger"
          isOpen={!!this.state && this.state.open}
          handleClose={this.handleClose}
          onCancel={this.handleClose}
          onConfirm={this.handleConfirm}
          {...otherProps}
        />
        <button
          id={this.props.buttonId}
          onClick={() => this.setState({open: true})}
          style={dataStyles.redButton}
        >
          {this.props.buttonText}
        </button>
      </div>
    );
  }
});

export default Radium(ConfirmDeleteButton);
