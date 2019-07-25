import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'react-bootstrap';

export default class MoveEnrollmentsDialog extends React.Component {
  static propTypes = {
    selectedEnrollments: PropTypes.array,
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func
  };

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Move Enrollments</Modal.Title>
        </Modal.Header>
        <Modal.Body>Move Em!</Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.props.onConfirm}>
            Move
          </Button>
          <Button onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
