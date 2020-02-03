import React from 'react';
import commonStyles from './styles';

/**
 * Publish iOS Page in Export Dialog
 */
export default class PublishIOSPage extends React.Component {
  render() {
    return (
      <div>
        <div style={commonStyles.section}>
          <p style={commonStyles.title}>Create iOS App Store Package</p>
        </div>
        <div style={commonStyles.section}>
          <p style={commonStyles.text}>
            An iOS App Store Package (IPA) is a package of code and other files
            that can be installed as an app on an iOS device.
          </p>
          <p style={commonStyles.text}>
            <b>Note: </b>You must have an Apple developer account to create an
            IPA using our Code.org partner site, Expo.io.
          </p>
          <p style={commonStyles.text}>
            <b>Note: </b>After you click "Continue with Expo.io", you will need
            to create an Expo account if you don't have one already. You will
            then be asked to enter your Apple developer account credentials in
            order to continue.
          </p>
        </div>
      </div>
    );
  }
}
