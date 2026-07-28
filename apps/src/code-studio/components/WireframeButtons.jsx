import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
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

const SEND_TO_PHONE_PANEL_ID = 'send-to-phone-panel';

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
    this.setState(state => ({clickedSendToPhone: !state.clickedSendToPhone}));
  };

  render() {
    const {appType, channelId, isLegacyShare} = this.props;
    const {clickedSendToPhone} = this.state;
    const showViewCode = APP_TYPES_WITH_VIEW_CODE.includes(appType);
    const appTypeAndLegacy = appType + (isLegacyShare ? '_legacy' : '');
    const newProjectUrl = APP_TYPE_TO_NEW_PROJECT_URL[appTypeAndLegacy];
    return (
      <div style={styles.main}>
        <div className="WireframeButtons_buttonRow">
          {showViewCode && <ViewCodeButton />}
          {newProjectUrl && <NewProjectButton url={newProjectUrl} />}
          <SendToPhoneButton
            active={clickedSendToPhone}
            onClick={this.handleClickSendToPhone}
          />
        </div>
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
  <MuiButton
    variant="contained"
    color="primary"
    size="small"
    href={project.getProjectUrl('/view')}
    startIcon={<FontAwesomeV6Icon iconName="code" />}
  >
    {i18n.viewCode()}
  </MuiButton>
);

const NewProjectButton = ({url}) => (
  <MuiButton
    variant="contained"
    color="primary"
    size="small"
    href={url}
    startIcon={
      <FontAwesomeV6Icon iconName="pen-to-square" iconStyle="regular" />
    }
  >
    {i18n.makeMyOwn()}
  </MuiButton>
);
NewProjectButton.propTypes = {
  url: PropTypes.string.isRequired,
};

const SendToPhoneButton = ({active, onClick}) => (
  <MuiButton
    variant="contained"
    color="primary"
    size="small"
    type="button"
    onClick={onClick}
    aria-expanded={active}
    aria-controls={SEND_TO_PHONE_PANEL_ID}
    startIcon={<FontAwesomeV6Icon iconName="mobile-screen-button" />}
  >
    {i18n.sendToPhone()}
  </MuiButton>
);
SendToPhoneButton.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

// ESLint doesn't seem to understand our inherited-proptypes pattern here
/* eslint-disable react/prop-types */
const SendToPhoneControls = ({appType, channelId, isLegacyShare}) => (
  <div className="WireframeButtons_active" id={SEND_TO_PHONE_PANEL_ID}>
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
