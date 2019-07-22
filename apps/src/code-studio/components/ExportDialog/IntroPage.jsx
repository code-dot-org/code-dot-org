import React from 'react';
import commonStyles from './styles';

/**
 * Intro Page in Export Dialog
 */
export default class IntroPage extends React.Component {
  render() {
    return (
      <div>
        <div style={commonStyles.section}>
          <p style={commonStyles.title}>
            Code Studio can export your project as a mobile app for iOS or
            Android
          </p>
        </div>
        <div style={commonStyles.section}>
          <p style={commonStyles.text}>
            Exporting will create a mobile app that you can install on your
            phone. You can install that app on your phone and run it without
            opening the Code.org website. If you make changes to your app after
            you export, you will need to export it again.
          </p>
        </div>
      </div>
    );
  }
}
