import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import moduleStyles from './send-to-phone.module.scss';

// Similar UI exists in sharing.html.ejs. At some point int he future, it may
// make sense to see if we can get rid of the stuff in the .ejs file

const SendState = {
  invalidVal: 'invalidVal',
  canSubmit: 'canSubmit',
  sending: 'sending',
  sent: 'sent',
  error: 'error',
};

function sendButtonString(sendState) {
  switch (sendState) {
    case SendState.invalidVal:
    case SendState.canSubmit:
      return 'Send';
    case SendState.sending:
      return 'Sending...';
    case SendState.sent:
      return 'Sent!';
    case SendState.error:
      return 'Error!';
    default:
      throw new Error('unexpected');
  }
}

/**
 * Send-to-phone component used by share project dialog.
 */
export default class SendToPhone extends React.Component {
  static propTypes = {
    isLegacyShare: PropTypes.bool.isRequired,
    channelId: PropTypes.string,
    appType: PropTypes.string.isRequired,
  };

  state = {sendState: SendState.invalidVal};

  phoneRef = React.createRef();

  componentDidMount() {
    this.maskPhoneInput();
  }

  maskPhoneInput() {
    const phone = this.phoneRef.current;
    if (!phone) {
      return;
    }

    $(phone).mask('(000) 000-0000', {
      onComplete: () => this.setState({sendState: SendState.canSubmit}),
      onChange: () => this.setState({sendState: SendState.invalidVal}),
    });
    phone.focus();
  }

  handleSubmit = () => {
    const {appType, channelId, isLegacyShare} = this.props;
    // Do nothing if we aren't in a state where we can send.
    if (this.state.sendState !== SendState.canSubmit) {
      return;
    }
    const phone = this.phoneRef.current;

    this.setState({sendState: SendState.sending});

    const params = {
      type: appType,
      phone: $(phone).val(),
    };
    if (isLegacyShare) {
      params.level_source = +location.pathname.split('/')[2];
    } else {
      params.channel_id = channelId;
    }

    $.post('/sms/send', $.param(params))
      .done(() => this.setState({sendState: SendState.sent}))
      .fail(() => this.setState({sendState: SendState.error}));
  };

  render() {
    const inputDisabled =
      this.state.sendState !== SendState.invalidVal &&
      this.state.sendState !== SendState.canSubmit;
    return (
      <div className={moduleStyles.root}>
        <TextField
          ref={this.phoneRef}
          id="phone"
          name="phone"
          label="Enter a US phone number:"
          size="s"
          onChange={() => {}}
          disabled={inputDisabled}
        />
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          type="button"
          disabled={this.state.sendState === SendState.invalidVal}
          onClick={this.handleSubmit}
        >
          {sendButtonString(this.state.sendState)}
        </MuiButton>
        <MuiTypography variant="body4" className={moduleStyles.disclaimer}>
          A text message will be sent via{' '}
          <Link
            href="http://twilio.com"
            text="Twilio"
            external
            openInNewTab
            size="xs"
            className={moduleStyles.twilioLink}
          />
          . Charges may apply to the recipient.
        </MuiTypography>
      </div>
    );
  }
}
