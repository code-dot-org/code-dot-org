/* globals $, dashboard */

var SendToPhone = window.dashboard ? window.dashboard.SendToPhone : undefined;

var styles = {
  main: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    textAlign: 'right',
    textShadow: '#000 -1px -1px 0',
    font: '12pt "Gotham 5r", sans-serif',
    color: '#8F9499'
  },
  icon: {
    fontSize: '1.5em'
  },
  sendToPhone: {
    label: {
      font: '12pt "Gotham 5r", sans-serif',
      color: '#8F9499'
    },
    div: {
      margin: 0
    }
  }
};


/**
 * Shows a prompt for SendToPhone. On click, replaces prompt with our
 * SendToPhone component.
 */
module.exports = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    appType: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      clicked: false
    };
  },

  handleClick: function () {
    this.setState({clicked: !this.state.clicked});
    return false; // so the # link doesn't go anywhere.
  },

  render: function () {
    return (
      <div style={styles.main}>
        {this.renderSendToPhone()}
        <a className="WireframeSendToPhone_send-to-phone-link" href="#" onClick={this.handleClick}>
          <i style={styles.icon} className="fa fa-mobile"/> See this app on your phone
        </a>
      </div>
    );
  },

  renderSendToPhone: function () {
    if (this.state.clicked) {
      return (
        <SendToPhone
          styles={styles.sendToPhone}
          channelId={this.props.channelId}
          appType={this.props.appType}
        />
      );
    }
  }
});
