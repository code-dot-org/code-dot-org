/* globals $, dashboard */

var SendToPhone = window.dashboard.SendToPhone;

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
        <div style={styles.main} onClick={this.handleClick}>
          <i style={styles.icon} className="fa fa-mobile"></i> See this app on your phone
        </div>
      );
    }

    return (
      <div style={styles.main}>
        <SendToPhone styles={styles.sendToPhone}/>
      </div>
    );
  }
});
