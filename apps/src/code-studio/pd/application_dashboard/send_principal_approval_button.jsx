import React, {PropTypes} from 'react';
import Spinner from '../components/spinner.jsx';
import $ from 'jquery';
import {Button} from 'react-bootstrap';

export default class SendPrincipalApprovalButton extends React.Component {
  static propTypes = {
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      requestSending: false,
      requestSent: false
    };
  }

  sendPrincipalApproval = () => {
    this.setState({
      requestSending: true
    });

    $.ajax({
      method: 'POST',
      url: `/api/v1/pd/application/resend_principal_approval/${this.props.id}`
    }).done(data => {
      this.setState({
        requestSent: true
      });
    });
  };

  render() {
    if (this.state.requestSent) {
      return (
        <span>
          Email sent!
        </span>
      );
    } else if (this.state.requestSending) {
      return (<Spinner size="small"/>);
    } else {
      return (
        <Button
          bsSize="xsmall"
          target="_blank"
          onClick={this.sendPrincipalApproval}
        >
          Send email to principal
        </Button>
      );
    }
  }
}
