/* eslint-disable react/no-danger */
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import color from '../../../util/color';
import {PLATFORM_ANDROID, PLATFORM_IOS} from '../../../util/exporterConstants';
import SendToPhone from '../SendToPhone';
import commonStyles from './styles';

/**
 * Generating Page in Export Dialog
 */
export default class GeneratingPage extends React.Component {
  static propTypes = {
    appType: PropTypes.string.isRequired,
    platform: PropTypes.oneOf([PLATFORM_IOS, PLATFORM_ANDROID]).isRequired,
    isGenerating: PropTypes.bool.isRequired,
    exportError: PropTypes.string,
    apkError: PropTypes.string,
    apkUri: PropTypes.string
  };

  state = {
    showSendToPhone: false
  };

  onInputSelect = ({target}) => {
    target.select();
  };

  showSendToPhone = () => {
    this.setState({
      showSendToPhone: true
    });
  };

  render() {
    const {showSendToPhone} = this.state;
    const {
      appType,
      platform,
      exportError,
      apkError,
      apkUri = '',
      isGenerating
    } = this.props;
    const error = exportError || apkError;
    const isAndroid = platform === PLATFORM_ANDROID;
    const packageType = isAndroid ? 'Android' : 'iOS App Store';
    const successTitle = isAndroid
      ? 'The Android Package was created successfully'
      : 'Your app is ready to be exported';
    const titleText = isGenerating
      ? `Creating ${packageType} Package...`
      : error
      ? `Error creating ${packageType} Package`
      : successTitle;
    let headerText;
    if (isAndroid) {
      headerText = isGenerating
        ? 'Please wait for about <b>15 minutes</b>.'
        : error || 'Send this link to your device to install the app.';
    } else {
      headerText = isGenerating ? 'Please wait.' : error || '';
    }
    return (
      <div>
        <div style={commonStyles.section}>
          <p style={commonStyles.title}>{titleText}</p>
        </div>
        <div style={commonStyles.section}>
          <p
            style={commonStyles.text}
            dangerouslySetInnerHTML={{__html: headerText}}
          />
        </div>
        <div style={commonStyles.section}>
          {isGenerating && (
            <i style={styles.spinner} className="fa fa-spinner fa-spin" />
          )}
          {!isGenerating && !error && isAndroid && (
            <div>
              <div style={styles.apkUriContainer}>
                <input
                  type="text"
                  onClick={this.onInputSelect}
                  readOnly="true"
                  value={apkUri}
                  style={styles.uriInput}
                />
              </div>
              <button
                type="button"
                style={styles.sendToPhoneButton}
                onClick={this.showSendToPhone}
              >
                <div style={styles.sendToPhoneButtonBody}>
                  <i
                    className="fa fa-mobile-phone"
                    style={styles.sendToPhoneIcon}
                  />
                  <span>{i18n.sendToPhone()}</span>
                </div>
              </button>
              {showSendToPhone && (
                <SendToPhone
                  appType={appType}
                  downloadUrl={apkUri}
                  isLegacyShare={false}
                  styles={{label: styles.phoneLabel}}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  uriInput: {
    cursor: 'copy',
    width: 'unset'
  },
  spinner: {
    fontSize: 24
  },
  phoneLabel: {
    marginTop: 15,
    marginBottom: 0
  },
  apkUriContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  sendToPhoneButton: {
    ...commonStyles.button,
    backgroundColor: color.purple,
    color: color.white
  },
  sendToPhoneButtonBody: {
    display: 'flex',
    alignItems: 'center'
  },
  sendToPhoneIcon: {
    fontSize: 32,
    width: 30,
    margin: '-8px 0'
  }
};
