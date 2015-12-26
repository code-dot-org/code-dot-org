/* globals $, dashboard */

var SendToPhone = window.dashboard.SendToPhone;

/**
 * Shows a prompt for SendToPhone. On click, replaces prompt with our
 * SendToPhone component.
 */
module.exports = React.createClass({
  getInitialState: function () {
    return {
      clicked: false
    };
  },

  handleClick: function () {
    this.setState({clicked: true});
  },

  render: function () {
    if (!this.state.clicked) {
      return (
        <div onClick={this.handleClick}>
          <i className="fa fa-mobile"></i> See this app on your phone
        </div>
      );
    }

    return <SendToPhone/>;
  }
});
