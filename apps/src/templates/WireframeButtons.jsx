/* global dashboard */

var React = require('react');

var SendToPhone = window.dashboard ? window.dashboard.SendToPhone : undefined;

var styles = {
  main: {
    font: '12pt "Gotham 5r", sans-serif',
  },
  sendToPhone: {
    label: {
      font: '12pt "Gotham 5r", sans-serif',
      lineHeight: 'normal',
      cursor: 'default',
    },
    div: {
      margin: 0,
      lineHeight: 'normal',
    },
  }
};


const PROJECT_URL_PATTERN = /^(.*\/projects\/\w+\/[\w\d-]+)\/.*/;

/**
 * @returns the absolute url to the root of this project without a trailing slash.
 *     For example: http://studio.code.org/projects/applab/GobB13Dy-g0oK
 */
function getProjectUrl() {
  const match = location.href.match(PROJECT_URL_PATTERN);
  if (match) {
    return match[1];
  }
  return location.href; // i give up. Let's try this?
}


/**
 * @param url complete url, possibly including query string
 * @param fragment text to add to url path, before query string if any
 * @returns new url
 */
function appendUrl(url, fragment) {
  var queryIndex = url.indexOf('?');
  if (queryIndex === -1) {
    return url + fragment;
  }
  return url.substring(0, queryIndex) + fragment + url.substring(queryIndex);
}


/**
 * Shows buttons for wireframe version, including "View code", "Make my own app", and "Send to phone".
 */
module.exports = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    appType: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    //  "Send to phone" button is a toggle that shows and hides send to phone form.
    return {
      clickedSendToPhone: false
    };
  },

  handleClickSendToPhone: function () {
    this.setState({clickedSendToPhone: !this.state.clickedSendToPhone});
    return false; // so the # link doesn't go anywhere.
  },

  getSendToPhoneButtonClass: function () {
    return this.state.clickedSendToPhone ? 'WireframeButtons_active' : 'WireframeButtons_button';
  },

  render: function () {
    return (
      <div style={styles.main}>
        <a className="WireframeButtons_button" href={appendUrl(getProjectUrl(), '/view')}>
          <i className="fa fa-code"/> View code
        </a><sp/>
        <a className="WireframeButtons_button" href="/projects/applab/new">
          <i className="fa fa-pencil-square-o"/> Make my own app
        </a><sp/>
        <a className={this.getSendToPhoneButtonClass()} href="#" onClick={this.handleClickSendToPhone}>
          <i className="fa fa-mobile"/> Send to phone
        </a>
        <br />
        {this.renderSendToPhone()}
      </div>
    );
  },

  renderSendToPhone: function () {
    if (this.state.clickedSendToPhone) {
      return (
        <div className="WireframeButtons_active">
          <SendToPhone
            styles={styles.sendToPhone}
            channelId={this.props.channelId}
            appType={this.props.appType}
          />
        </div>
      );
    }
  }
});
