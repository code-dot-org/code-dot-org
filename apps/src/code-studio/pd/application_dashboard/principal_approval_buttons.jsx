import React, {PropTypes} from 'react';
import Spinner from '../components/spinner.jsx';
import $ from 'jquery';
import {Button} from 'react-bootstrap';

const styles = {
  button: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
  }
};

export default class PrincipalApprovalButtons extends React.Component {
  static propTypes = {
    applicationId: PropTypes.oneOfType([
      // Depending on context, the applicationId can come from json as a number,
      // or from the url route as a string.
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    showSendEmailButton: PropTypes.bool,
    showNotRequiredButton: PropTypes.bool,
    onChange: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      sendEmailRequest: null,
      notRequiredRequest: null,
      showSendEmailButton: this.props.showSendEmailButton,
      showNotRequiredButton: this.props.showNotRequiredButton
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
      url: `/api/v1/pd/application/teacher/${this.props.applicationId}/send_principal_approval`
    }).done(data => {
      this.props.onChange(
        this.props.applicationId,
        data.principal_approval
      );
      this.setState({
        sendEmailRequest: null,
        showSendEmailButton: false
      });
    });

    this.setState({sendEmailRequest});
  };

  handleNotRequiredClick = () => {
    const notRequiredRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/application/teacher/${this.props.applicationId}/principal_approval_not_required`
    }).done(data => {
      this.props.onChange(
        this.props.applicationId,
        data.principal_approval
      );

      this.setState({
        notRequiredRequest: null,
        showNotRequiredButton: false
      });
    });

    this.setState({notRequiredRequest});
  };

  renderSendEmailButton() {
    if (this.state.sendEmailRequest) {
      return <Spinner size="small" />;
    }

    return (
      <Button
        bsSize="xsmall"
        target="_blank"
        onClick={this.handleSendEmailClick}
        style={styles.button}

        // This button is disabled if the other action is pending (which will be rendered as a spinner)
        disabled={!!this.state.notRequiredRequest}
      >
        Send email
      </Button>
    );
  }

  renderNotRequiredButton() {
    if (this.state.notRequiredRequest) {
      return <Spinner size="small" />;
    }

    return (
      <Button
        bsSize="xsmall"
        target="_blank"
        onClick={this.handleNotRequiredClick}
        style={styles.button}

        // This button is disabled if the other action is pending (which will be rendered as a spinner)
        disabled={!!this.state.sendEmailRequest}
      >
        Not required
      </Button>
    );
  }

  render() {
    return (
      <div>
        {this.state.showSendEmailButton && this.renderSendEmailButton()}
        {this.state.showNotRequiredButton && this.renderNotRequiredButton()}
      </div>
    );
  }
}
