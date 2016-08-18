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
    bodyText: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.headerText}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.bodyText}
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.props.onOk}>OK</Button>
          <Button onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});
export default ConfirmationDialog;
