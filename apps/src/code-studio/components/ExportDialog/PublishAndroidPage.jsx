import React from 'react';
import commonStyles from './styles';

/**
 * Publish Android Page in Export Dialog
 */
export default class PublishAndroidPage extends React.Component {
  render() {
    return (
      <div>
        <div style={commonStyles.section}>
          <p style={commonStyles.title}>Create Android Package</p>
        </div>
        <div style={commonStyles.section}>
          <p style={commonStyles.text}>
            An Android Package (APK) is a package of code and other files that
            can be installed as an app on an Android device.
          </p>
          <p style={commonStyles.text}>
            <b>Note: </b>After you click "Create", it will take about 10-15
            minutes to create the package.
          </p>
        </div>
      </div>
    );
  }
}
