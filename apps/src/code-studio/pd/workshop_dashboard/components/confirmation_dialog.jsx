/**
 * Modal confirmation (OK/Cancel) dialog with custom text and events.
 */
import React from 'react';
import {Modal, Button} from 'react-bootstrap';

const ConfirmationDialog = React.createClass({
  propTypes: {
    show: React.PropTypes.bool,
    onOk: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    headerText: React.PropTypes.string.isRequired,
    bodyText: React.PropTypes.string.isRequired,
    okText: React.PropTypes.string,
    cancelText: React.PropTypes.string,
    width: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      okText: "OK",
      cancelText: "Cancel",
      width: 500
    };
  },

  render() {
    const style = {
      width: this.props.width,
      marginLeft: - this.props.width / 2
    };

    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onCancel}
        style={style}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.props.headerText}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.bodyText}
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.props.onOk}>
            {this.props.okText}
          </Button>
          <Button onClick={this.props.onCancel}>
            {this.props.cancelText}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
});
export default ConfirmationDialog;
