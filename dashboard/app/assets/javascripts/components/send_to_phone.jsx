/* global React */

window.dashboard = window.dashboard || {};

/**
 * Send-to-phone component used by share project dialog.
 */
window.dashboard.SendToPhone = (function (React) {
  return React.createClass({
    propTypes: {
      showLead: React.PropTypes.bool.isRequired
    },

    getInitialState: function () {
      return {
        showLead: this.props.showLead,
        canSubmit: false
      };
    },

    componentDidMount: function () {
      if (this.refs.phone) {
        this.refs.phone.focus();
      }
    },

    componentDidUpdate: function () {
      if (this.refs.phone) {
        this.refs.phone.focus();
      }
    },

    clickLead: function (event) {
      this.setState({showLead: false});
    },

    handleSubmit: function () {
    },

    render: function () {
      if (this.state.showLead) {
        return (
          <div onClick={this.clickLead}>
            <i className="fa fa-mobile"></i> See this app on your phone
          </div>
        );
      }

      // TODO - can i get rid of some ids?
      return (
        <div id="send-to-phone" className="sharing">
          <label htmlFor="phone">Enter a US phone number:</label>
          <input type="text" id="phone" ref="phone" name="phone"></input>
          <button id="phone-submit" disabled={!this.state.canSubmit}>
            Send
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
