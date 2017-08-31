import React from 'react';
import YourSchoolResources from './YourSchoolResources';
import Notification from './Notification';
import i18n from "@cdo/locale";

const styles = {
  description: {
    marginBottom: 20
  },
};

export default class YourSchool extends React.Component {
  render() {
    return (
      <div>
        <h1>
          {i18n.yourSchoolHeading()}
        </h1>
        <Notification
          type="bullhorn"
          notice="Something exciting happened"
          details="Here's some more information about the exciting thing"
          dismissible={false}
          buttonText="Learn more"
          buttonLink="/blog"
          newWindow={true}
          isRtl={false}
        />
      <h3 style={styles.description}>
          {i18n.yourSchoolDescription()}
        </h3>
        <YourSchoolResources/>
        <h2>
          {i18n.yourSchoolTellUs()}
        </h2>
        Hey, look! This is where the census form will be.
      </div>
    );
  }
}
