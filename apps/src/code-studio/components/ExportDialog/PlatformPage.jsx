import React from 'react';
import color from '../../../util/color';
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
  render() {
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
              readOnly
              checked
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
              disabled
            />
            <label htmlFor="radioIOS" style={styles.radioLabelDisabled}>
              I have an iOS device (currently not supported)
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
