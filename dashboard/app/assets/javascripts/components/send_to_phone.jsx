/* global React, dashboard, trackEvent */

window.dashboard = window.dashboard || {};

/**
 * Send-to-phone component used by share project dialog.
 */
window.dashboard.SendToPhone = (function (React) {
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

  return React.createClass({
    propTypes: {
      showLead: React.PropTypes.bool.isRequired
    },

    getInitialState: function () {
      return {
        showLead: this.props.showLead,
        sendState: SendState.invalidVal
      };
    },

    componentDidMount: function () {
      this.maskPhoneInput();
    },

    componentDidUpdate: function () {
      // TODO - only needed because of showLead I think?
      this.maskPhoneInput();
    },

    // TODO - lead should maybe be separate component
    clickLead: function (event) {
      this.setState({showLead: false});
    },

    maskPhoneInput: function () {
      // TODO - what happens when called multiple times
      if (this.refs.phone) {
        var phone = this.refs.phone.getDOMNode();
        // TODO - consider case where we showLead to start
        $(phone).mask('(000) 000-0000', {
          onComplete: function () {
            this.setState({sendState: SendState.canSubmit});
          }.bind(this),
          onChange: function () {
            this.setState({sendState: SendState.invalidVal});
          }.bind(this),
        });
        phone.focus();
      }
    },

    handleSubmit: function () {
      // Do nothing if we aren't in a state where we can send.
      if (this.state.sendState !== SendState.canSubmit) {
        return;
      }
      var phone = this.refs.phone.getDOMNode();

      // TODO - should we be reaching into dashboard.project, or passing these
      // funcs in? same with trackEvent
      this.setState({sendState: SendState.sending});

      var params = $.param({
        type: dashboard.project.getStandaloneApp(),
        channel_id: dashboard.project.getCurrentId(),
        phone: $(phone).val()
      });
      $.post('/sms/send', params)
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
      if (this.state.showLead) {
        return (
          <div onClick={this.clickLead}>
            <i className="fa fa-mobile"></i> See this app on your phone
          </div>
        );
      }

      // TODO - twilio doesnt work from localhost
      return (
        <div id="send-to-phone" className="sharing">
          <label htmlFor="phone">Enter a US phone number:</label>
          <input
            type="text"
            id="phone"
            ref="phone"
            name="phone"
            disabled={this.state.sendState !== SendState.invalidVal &&
              this.state.sendState !== SendState.canSubmit}>
          </input>
          <button
              id="phone-submit"
              disabled={this.state.sendState === SendState.invalidval}
              onClick={this.handleSubmit}>
            {sendButtonString(this.state.sendState)}
          </button>
          <div id="phone-charges">
            A text message will be sent via <a href="http://twilio.com">Twilio</a>.
            Charges may apply to the recipient.
          </div>
        </div>
      );
    }
  });
})(React);
