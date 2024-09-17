import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import i18n from '@cdo/locale';

import project from '../initApp/project';

import SendToPhone from './SendToPhone';

/**
 * List of app types for which we should show a "View code" button here. Other
 * types will have a "How it works" button on the app itself, viewable on mobile
 * devices.
 */
const APP_TYPES_WITH_VIEW_CODE = ['applab', 'gamelab', 'makerlab'];

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
    clickedSendToPhone: false,
  };

  handleClickSendToPhone = () => {
    this.setState({clickedSendToPhone: !this.state.clickedSendToPhone});
    return false; // so the # link doesn't go anywhere.
  };

  render() {
    const {appType, channelId, isLegacyShare} = this.props;
    const {clickedSendToPhone} = this.state;
    const showViewCode = APP_TYPES_WITH_VIEW_CODE.includes(appType);
    const appTypeAndLegacy = appType + (isLegacyShare ? '_legacy' : '');
    const newProjectUrl = APP_TYPE_TO_NEW_PROJECT_URL[appTypeAndLegacy];
    return (
      <div style={styles.main}>
        {showViewCode && <ViewCodeButton />}
        {newProjectUrl && <NewProjectButton url={newProjectUrl} />}
        <SendToPhoneButton
          active={clickedSendToPhone}
          onClick={this.handleClickSendToPhone}
        />
        <br />
        {clickedSendToPhone && (
          <SendToPhoneControls
            appType={appType}
            channelId={channelId}
            isLegacyShare={isLegacyShare}
          />
        )}
      </div>
    );
  }
}

const ViewCodeButton = () => (
  <span style={{display: 'inline-block'}}>
    <a
      className="WireframeButtons_button"
      href={project.getProjectUrl('/view')}
    >
      <i className="fa fa-code" /> {i18n.viewCode()}
    </a>
  </span>
);

const NewProjectButton = ({url}) => (
  <span style={{display: 'inline-block'}}>
    <a className="WireframeButtons_button" href={url}>
      <i className="fa fa-pencil-square-o" /> {i18n.makeMyOwn()}
    </a>
  </span>
);
NewProjectButton.propTypes = {
  url: PropTypes.string.isRequired,
};

const SendToPhoneButton = ({active, onClick}) => (
  <span style={{display: 'inline-block'}}>
    <a
      className={active ? 'WireframeButtons_active' : 'WireframeButtons_button'}
      onClick={onClick}
    >
      <i className="fa fa-mobile" /> {i18n.sendToPhone()}
    </a>
  </span>
);
SendToPhoneButton.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

// ESLint doesn't seem to understand our inherited-proptypes pattern here
/* eslint-disable react/prop-types */
const SendToPhoneControls = ({appType, channelId, isLegacyShare}) => (
  <div className="WireframeButtons_active">
    <SendToPhone
      styles={styles.sendToPhone}
      channelId={channelId}
      appType={appType}
      isLegacyShare={isLegacyShare}
    />
  </div>
);
SendToPhoneControls.propTypes = _.pick(WireframeButtons.propTypes, [
  'appType',
  'channelId',
  'isLegacyShare',
]);
/* eslint-enable react/prop-types */

const styles = {
  main: {
    fontSize: '12pt',
    ...fontConstants['main-font-semi-bold'],
  },
  sendToPhone: {
    label: {
      fontSize: '12pt',
      ...fontConstants['main-font-semi-bold'],
      lineHeight: 'normal',
      cursor: 'default',
    },
    div: {
      margin: 0,
      lineHeight: 'normal',
    },
  },
};
