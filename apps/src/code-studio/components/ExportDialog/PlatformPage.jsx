import PropTypes from 'prop-types';
import React from 'react';
import color from '../../../util/color';
import {PLATFORM_ANDROID, PLATFORM_IOS} from '../../../util/exporter';
import experiments from '../../../util/experiments';
import commonStyles from './styles';

const styles = {
  radioLabel: {
    ...commonStyles.text,
    display: 'inline-block'
  },
  radioLabelDisabled: {
    ...commonStyles.text,
    display: 'inline-block',
    color: color.light_gray
  },
  radioInput: {
    height: 18,
    verticalAlign: 'middle'
  }
};

/**
 * Platform Page in Export Dialog
 */
export default class PlatformPage extends React.Component {
  static propTypes = {
    platform: PropTypes.oneOf([PLATFORM_IOS, PLATFORM_ANDROID]).isRequired,
    onPlatformChanged: PropTypes.func.isRequired
  };

  onRadioChange = ({target}) => {
    const {id} = target;
    const {onPlatformChanged} = this.props;
    const platform = id === 'radioAndroid' ? PLATFORM_ANDROID : PLATFORM_IOS;
    onPlatformChanged(platform);
  };

  render() {
    const {platform} = this.props;
    const allowIOS = experiments.isEnabled('exportIOS');
    const iOSLabelStyle = allowIOS
      ? styles.radioLabel
      : styles.radioLabelDisabled;
    const iOSLabelText = `I have an iOS device${
      allowIOS ? '' : ' (currently not supported)'
    }`;
    return (
      <div>
        <div style={commonStyles.section}>
          <p style={commonStyles.title}>Choose your platform</p>
        </div>
        <div style={commonStyles.section}>
          <div>
            <input
              style={styles.radioInput}
              type="radio"
              id="radioAndroid"
              checked={platform === PLATFORM_ANDROID}
              onChange={this.onRadioChange}
            />
            <label htmlFor="radioAndroid" style={styles.radioLabel}>
              I have an Android device
            </label>
          </div>
          <div>
            <input
              style={styles.radioInput}
              type="radio"
              id="radioIOS"
              checked={platform === PLATFORM_IOS}
              disabled={!allowIOS}
              onChange={this.onRadioChange}
            />
            <label htmlFor="radioIOS" style={iOSLabelStyle}>
              {iOSLabelText}
            </label>
          </div>
        </div>
        <div style={commonStyles.section}>
          <p style={commonStyles.text}>
            <b>Note: </b>Exporting will take 10-15 minutes. If you change your
            app after you start exporting, those changes will not be included.
          </p>
        </div>
      </div>
    );
  }
}
