import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import trackEvent from '../../util/trackEvent';

// TODO (brent) - could we also use this instead of what we have in sharing.html.ejs?

var SendState = {
  invalidVal: 'invalidVal',
  canSubmit: 'canSubmit',
  sending: 'sending',
  sent: 'sent',
  error: 'error'
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

var baseStyles = {
  label: {},
  div: {}
};

/**
 * Send-to-phone component used by share project dialog.
 */
var SendToPhone = React.createClass({
  propTypes: {
    isLegacyShare: React.PropTypes.bool.isRequired,
    channelId: React.PropTypes.string,
    appType: React.PropTypes.string.isRequired,
    styles: React.PropTypes.shape({
      label: React.PropTypes.object,
      div: React.PropTypes.object,
    })
  },

  getInitialState: function () {
    return {
      sendState: SendState.invalidVal
    };
  },

  componentDidMount: function () {
    this.maskPhoneInput();
  },

  maskPhoneInput: function () {
    if (!this.refs.phone) {
      return;
    }

    var phone = this.refs.phone;
    $(phone).mask('(000) 000-0000', {
      onComplete: function () {
        this.setState({sendState: SendState.canSubmit});
      }.bind(this),
      onChange: function () {
        this.setState({sendState: SendState.invalidVal});
      }.bind(this),
    });
    phone.focus();
  },

  handleSubmit: function () {
    // Do nothing if we aren't in a state where we can send.
    if (this.state.sendState !== SendState.canSubmit) {
      return;
    }
    var phone = this.refs.phone;

    this.setState({sendState: SendState.sending});

    const params = {
      type: this.props.appType,
      phone: $(phone).val(),
    };
    if (this.props.isLegacyShare) {
      params.level_source = +location.pathname.split('/')[2];
    } else {
      params.channel_id = this.props.channelId;
    }

    $.post('/sms/send', $.param(params))
      .done(function () {
        this.setState({sendState: SendState.sent});
        trackEvent('SendToPhone', 'success');
      }.bind(this))
      .fail(function () {
        this.setState({sendState: SendState.error});
        trackEvent('SendToPhone', 'error');
      }.bind(this));
  },

  render: function () {
    var styles = _.assign({}, baseStyles, this.props.styles);
    return (
      <div>
        <label style={styles.label} htmlFor="phone">Enter a US phone number:</label>
        <input
          type="text"
          ref="phone"
          name="phone"
          style={{height: 32, margin: 0}}
          disabled={this.state.sendState !== SendState.invalidVal &&
                      this.state.sendState !== SendState.canSubmit}
        />
        <button
          disabled={this.state.sendState === SendState.invalidVal}
          onClick={this.handleSubmit}
        >
            {sendButtonString(this.state.sendState)}
        </button>
        <div style={styles.div}>
          A text message will be sent via <a href="http://twilio.com">Twilio</a>.
          Charges may apply to the recipient.
        </div>
      </div>
    );
  }
});
module.exports = SendToPhone;

// We put this on the dashboard namespace so that it's accessible to apps
window.dashboard = window.dashboard || {};
window.dashboard.SendToPhone = SendToPhone;
