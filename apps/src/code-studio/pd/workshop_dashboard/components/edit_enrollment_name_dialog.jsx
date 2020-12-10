import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Button, Row, Col, FormGroup} from 'react-bootstrap';
import _ from 'lodash';

export default class EditEnrollmentNameDialog extends React.Component {
  static propTypes = {
    selectedEnrollment: PropTypes.object,
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onEdit: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClickUpdate = this.handleClickUpdate.bind(this);
  }

  // set initial value for each input field when modal is shown
  componentDidUpdate(prevProps) {
    if (!prevProps.show && this.props.show) {
      this.setState({
        firstName: this.props.selectedEnrollment.first_name,
        lastName: this.props.selectedEnrollment.last_name
      });
    }
  }

  handleInputChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  handleClickUpdate() {
    this.props.onEdit(_.pick(this.state, ['firstName', 'lastName']));
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Enrollee Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <Row>
              <Col sm={3}>First name:</Col>
              <Col sm={3}>
                <input
                  type="text"
                  name="firstName"
                  value={this.state.firstName}
                  onChange={this.handleInputChange}
                />
              </Col>
            </Row>
          </FormGroup>
          <FormGroup>
            <Row>
              <Col sm={3}>Last name:</Col>
              <Col sm={3}>
                <input
                  type="text"
                  name="lastName"
                  value={this.state.lastName}
                  onChange={this.handleInputChange}
                />
              </Col>
            </Row>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.handleClickUpdate}>
            Update
          </Button>
          <Button onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
