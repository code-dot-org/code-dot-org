import PropTypes from 'prop-types';
import React from 'react';
import Spinner from '../components/spinner.jsx';
import ConfirmationDialog from '../components/confirmation_dialog';
import $ from 'jquery';
import {Button} from 'react-bootstrap';

export default class PrincipalApprovalButtons extends React.Component {
  static propTypes = {
    applicationId: PropTypes.oneOfType([
      // Depending on context, the applicationId can come from json as a number,
      // or from the url route as a string.
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    showSendEmailButton: PropTypes.bool,
    showResendEmailButton: PropTypes.bool,
    showChangeRequirementButton: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    applicationStatus: PropTypes.string,
    approvalRequired: PropTypes.bool
  };

  constructor(props) {
    super(props);

    const appStatusesForSendingEmail = [
      'awaiting_admin_approval',
      'pending',
      'waitlisted'
    ];

    this.state = {
      sendEmailRequest: null,
      notRequiredRequest: null,
      showSendEmailButton:
        appStatusesForSendingEmail.includes(this.props.applicationStatus) &&
        (this.props.showSendEmailButton || this.props.showResendEmailButton),
      showChangeRequirementButton: this.props.showChangeRequirementButton,
      showResendEmailConfirmation: false,
      approvalRequired: this.props.approvalRequired
    };
  }

  componentWillUnmount() {
    if (this.state.sendEmailRequest) {
      this.state.sendEmailRequest.abort();
    }
    if (this.state.notRequiredRequest) {
      this.state.notRequiredRequest.abort();
    }
  }

  handleSendEmailClick = () => {
    const sendEmailRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/application/teacher/${
        this.props.applicationId
      }/send_principal_approval`
    }).done(data => {
      this.props.onChange(this.props.applicationId, data.principal_approval);
      this.setState({
        sendEmailRequest: null,
        showSendEmailButton: false
      });
    });

    this.setState({sendEmailRequest});
  };

  handleResendEmailClick = () => {
    this.setState({
      showResendEmailConfirmation: true
    });
  };

  handleResendEmailConfirmed = () => {
    this.handleSendEmailClick();
  };

  handleResendEmailCancel = () => {
    this.setState({
      showResendEmailConfirmation: false
    });
  };

  handleChangeRequiredStatus = () => {
    const newApprovalRequiredStatus = !this.state.approvalRequired;

    const changeRequirementRequest = $.ajax({
      method: 'POST',
      data: {principal_approval_not_required: !newApprovalRequiredStatus},
      url: `/api/v1/pd/application/teacher/${
        this.props.applicationId
      }/change_principal_approval_requirement`
    }).done(data => {
      this.props.onChange(this.props.applicationId, data.principal_approval);

      this.setState({
        changeRequirementRequest: null,
        approvalRequired: newApprovalRequiredStatus
      });
    });

    this.setState({changeRequirementRequest});
  };

  renderSendEmailButton() {
    if (this.state.sendEmailRequest) {
      return <Spinner size="small" />;
    }

    const buttonOnClick = this.props.showResendEmailButton
      ? this.handleResendEmailClick
      : this.handleSendEmailClick;
    const buttonText = this.props.showResendEmailButton
      ? 'Resend request'
      : 'Send email';

    return (
      <div>
        <Button
          bsSize="xsmall"
          target="_blank"
          onClick={buttonOnClick}
          style={styles.element}
          // This button is disabled if the other action is pending (which will be rendered as a spinner)
          disabled={!!this.state.changeRequirementRequest}
        >
          {buttonText}
        </Button>
        <ConfirmationDialog
          show={this.state.showResendEmailConfirmation}
          onOk={this.handleResendEmailConfirmed}
          onCancel={this.handleResendEmailCancel}
          headerText="Resend"
          bodyText="This will resend an email to this applicant’s administrator/school leader with a link to the recommendation form. Proceed?"
          okText="Resend"
        />
      </div>
    );
  }

  renderChangeRequirementButton() {
    if (this.state.changeRequirementRequest) {
      return <Spinner size="small" />;
    }

    return (
      <Button
        id="change-principal-approval-requirement"
        bsSize="xsmall"
        target="_blank"
        onClick={this.handleChangeRequiredStatus}
        style={styles.element}
        // This button is disabled if the other action is pending (which will be rendered as a spinner)
        disabled={!!this.state.sendEmailRequest}
      >
        {this.state.approvalRequired ? 'Make not required' : 'Make required'}
      </Button>
    );
  }

  render() {
    return (
      <div>
        <div style={styles.element}>
          {this.state.approvalRequired ? 'Is Required' : 'Not Required'}
        </div>
        {this.state.showSendEmailButton && this.renderSendEmailButton()}
        {this.state.showChangeRequirementButton &&
          this.renderChangeRequirementButton()}
      </div>
    );
  }
}

const styles = {
  element: {
    margin: 5
  }
};
