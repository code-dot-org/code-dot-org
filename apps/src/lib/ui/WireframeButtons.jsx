import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import SendToPhone from '../../code-studio/components/SendToPhone';
import project from '../../code-studio/initApp/project';

const styles = {
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
  gamelab: 'https://code.org/educate/gamelab',
  gamelab_legacy: 'https://code.org/educate/gamelab',
  playlab: '/p/playlab',
  playlab_legacy: '/s/playlab',
};

/**
 * Shows buttons for wireframe version, including "View code", "Make my own app", and "Send to phone".
 */
export default class WireframeButtons extends React.Component {
  static propTypes = {
    channelId: PropTypes.string,
    appType: PropTypes.string.isRequired,
    isLegacyShare: PropTypes.bool.isRequired,
  };

  state = {
    // "Send to phone" button is a toggle that shows and hides send to phone form.
    clickedSendToPhone: false
  };

  handleClickSendToPhone = () => {
    this.setState({clickedSendToPhone: !this.state.clickedSendToPhone});
    return false; // so the # link doesn't go anywhere.
  };

  getSendToPhoneButtonClass() {
    return this.state.clickedSendToPhone ? 'WireframeButtons_active' : 'WireframeButtons_button';
  }

  render() {
    return (
        <div style={styles.main}>
          {this.renderViewCodeButton()}
          {this.renderNewProjectButton()}
          <span style={{display: 'inline-block'}}>
            <a className={this.getSendToPhoneButtonClass()} onClick={this.handleClickSendToPhone}>
              <i className="fa fa-mobile"/> {i18n.sendToPhone()}
            </a>
          </span>
          <br />
          {this.renderSendToPhone()}
        </div>
    );
  }

  renderViewCodeButton() {
    if (APP_TYPES_WITH_VIEW_CODE.includes(this.props.appType)) {
      return (
          <span style={{display: 'inline-block'}}>
            <a className="WireframeButtons_button" href={project.getProjectUrl('/view')}>
              <i className="fa fa-code"/> {i18n.viewCode()}
            </a>
          </span>
      );
    }
  }

  renderNewProjectButton() {
    const { isLegacyShare } = this.props;
    const appTypeAndLegacy = this.props.appType + (isLegacyShare ? '_legacy' : '');
    const url = APP_TYPE_TO_NEW_PROJECT_URL[appTypeAndLegacy];
    if (url) {
      return (
          <span style={{display: 'inline-block'}}>
            <a className="WireframeButtons_button" href={url}>
              <i className="fa fa-pencil-square-o"/> {i18n.makeMyOwn()}
            </a>
          </span>
      );
    }
  }

  renderSendToPhone() {
    if (this.state.clickedSendToPhone) {
      return (
          <div className="WireframeButtons_active">
            <SendToPhone
              styles={styles.sendToPhone}
              channelId={this.props.channelId}
              appType={this.props.appType}
              isLegacyShare={this.props.isLegacyShare}
            />
          </div>
      );
    }
  }
}
