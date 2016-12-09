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
 * List of app types for which we should show a "View code" button here. Other
 * types will have a "How it works" button on the app itself, viewable on mobile
 * devices.
 */
const APP_TYPES_WITH_VIEW_CODE = [
  'applab',
  'gamelab',
  'makerlab',
];


/**
 * Url to which the "Make my own" button should go to, based on the type of the
 * currently displayed app, and whether or not it is the legacy version.
 */
const APP_TYPE_TO_NEW_PROJECT_URL = {
  applab: 'https://code.org/educate/applab',
  applab_legacy: 'https://code.org/educate/applab',
  artist: '/p/artist',
  artist_legacy: '/s/artist',
  gamelab: '/projects/gamelab/new',
  gamelab_legacy: '/projects/gamelab/new',
  playlab: '/p/playlab',
  playlab_legacy: '/s/playlab',
};



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
 * Appends the given fragment to the given url. Query string is retained, but hash string is removed.
 * Also ensures that string join does not end up duplicating '/' char.
 * @param url complete url
 * @param fragment text to add to url path, before query string if any
 * @returns new url
 */
export function appendUrl(url, fragment) {
  var hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    url = url.substring(0, hashIndex);
  }
  var queryString = '';
  var queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    queryString = url.substring(queryIndex);
    url = url.substring(0, queryIndex);
  }
  if (fragment.startsWith('/')) {
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
  }
  return url + fragment + queryString;
}


/**
 * Shows buttons for wireframe version, including "View code", "Make my own app", and "Send to phone".
 */
let WireframeButtons = React.createClass({
  propTypes: {
    channelId: React.PropTypes.string.isRequired,
    appType: React.PropTypes.string.isRequired,
    isLegacyShare: React.PropTypes.bool.isRequired,
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
          {this.renderViewCodeButton()}
          {this.renderNewProjectButton()}
          <a className={this.getSendToPhoneButtonClass()} onClick={this.handleClickSendToPhone}>
            <i className="fa fa-mobile"/> Send to phone
          </a>
          <br />
          {this.renderSendToPhone()}
        </div>
    );
  },

  renderViewCodeButton: function () {
    if (APP_TYPES_WITH_VIEW_CODE.includes(this.props.appType)) {
      return (
          <span>
            <a className="WireframeButtons_button" href={appendUrl(getProjectUrl(), '/view')}>
              <i className="fa fa-code"/> View code
            </a><sp/>
          </span>
      );
    }
  },

  renderNewProjectButton: function () {
    // Unfortunately, isLegacyShare currently has the wrong value (is true for non-legacy artist
    // and playlab). So instead, we check the first letter (after the /) in the path name of the
    // url, as legacy shares all start with /c
    // var isLegacyShare = this.props.isLegacyShare;
    var isLegacyShare = window.location.pathname[1] === 'c';
    var appTypeAndLegacy = this.props.appType + (isLegacyShare ? '_legacy' : '');
    var url = APP_TYPE_TO_NEW_PROJECT_URL[appTypeAndLegacy];
    if (url) {
      return (
          <span>
            <a className="WireframeButtons_button" href={url}>
              <i className="fa fa-pencil-square-o"/> Make my own
            </a><sp/>
          </span>
      );
    }
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
export default WireframeButtons;
