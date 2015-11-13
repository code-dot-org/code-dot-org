/* global React */

window.dashboard = window.dashboard || {};

/**
 * Send-to-phone component used by share project dialog.
 */
window.dashboard.SendToPhone = (function (React) {
  return React.createClass({
    propTypes: {},

    render: function () {
      return (
        <div id="send-to-phone" className="sharing" style={{display: 'none'}}>
          <label htmlFor="phone">Enter a US phone number:</label>
          <input type="text" id="phone" name="phone"></input>
          <button id="phone-submit">Send</button>
          <div id="phone-charges">
            A text message will be sent via <a href="http://twilio.com">Twilio</a>.
            Charges may apply to the recipient.
          </div>
        </div>
      );
    }
  });
})(React);
