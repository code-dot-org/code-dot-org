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

  renderSelectedEnrollments() {
    const enrollments = this.props.selectedEnrollments.map((enrollment, i) => {
      return (
        <li key={i}>
          {enrollment.first_name} {enrollment.last_name} ({enrollment.email})
        </li>
      );
    });

    return <ul>{enrollments}</ul>;
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Move Enrollments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>You are moving the following enrollments:</h3>
          {this.renderSelectedEnrollments()}
        </Modal.Body>
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
