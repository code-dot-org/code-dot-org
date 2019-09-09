import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'react-bootstrap';

const styles = {
  warning: {
    color: 'red'
  }
};

export default class MoveEnrollmentsDialog extends React.Component {
  static propTypes = {
    selectedEnrollments: PropTypes.array,
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onMove: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      destination_workshop_id: null
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClickMove = this.handleClickMove.bind(this);
  }

  handleInputChange(e) {
    this.setState({destination_workshop_id: e.target.value});
  }

  handleClickMove() {
    this.props.onMove(this.state.destination_workshop_id);
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Move Enrollments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h3>You are moving the following enrollments:</h3>
            <EnrollmentList enrollments={this.props.selectedEnrollments} />
            <h3 style={styles.warning}>
              Warning: moving enrollments will delete any associated attendance
              data!
            </h3>
            <h3>Destination workshop id:</h3>
            <h4>(The number at the end of the workshop's url)</h4>
            <input type="text" onChange={this.handleInputChange} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.handleClickMove}>
            Move
          </Button>
          <Button onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const EnrollmentList = ({enrollments}) => {
  return (
    <ul>
      {enrollments.map((enrollment, i) => {
        return (
          <li key={i}>
            {enrollment.first_name} {enrollment.last_name} ({enrollment.email})
          </li>
        );
      })}
    </ul>
  );
};

EnrollmentList.propTypes = {
  enrollments: PropTypes.array
};
