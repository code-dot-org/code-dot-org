import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import ConfirmationDialog from '../components/confirmation_dialog';

export default class EnrollmentCancelButton extends React.Component {
  static propTypes = {
    enrollmentCode: PropTypes.string.isRequired,
    workshopFriendlyName: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showConfirmation: false,
      canceled: false,
    };
  }

  componentWillUnmount() {
    if (this.cancelEnrollmentRequest) {
      this.cancelEnrollmentRequest.abort();
    }
  }

  handleCancelClick = () => {
    this.setState({showConfirmation: true});
  };

  handleCancelConfirmed = () => {
    this.cancelEnrollmentRequest = $.ajax({
      method: 'DELETE',
      url: `/api/v1/pd/enrollments/${this.props.enrollmentCode}`,
      dataType: 'json',
    }).done(() => {
      window.location.reload(true);
      // this.setState({canceled: true});
    });
  };

  handleCancelAborted = () => {
    this.setState({showConfirmation: false});
  };

  render() {
    return (
      <div>
        <p>
          Click below to cancel your registration in the{' '}
          {this.props.workshopFriendlyName}.
        </p>
        <p>
          <Button onClick={this.handleCancelClick}>Cancel</Button>
          <ConfirmationDialog
            show={this.state.showConfirmation}
            onOk={this.handleCancelConfirmed}
            onCancel={this.handleCancelAborted}
            headerText="Cancel Registration?"
            bodyText="Are you sure you want to cancel your registration?"
            okText="Yes, cancel registration"
            cancelText="No, keep registration"
          />
        </p>
      </div>
    );
  }
}
