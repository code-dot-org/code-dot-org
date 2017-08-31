import React from 'react';
import {UnconnectedCensusForm as CensusForm} from './CensusForm';
import YourSchoolResources from './YourSchoolResources';
import Notification from './Notification';
import i18n from "@cdo/locale";

const styles = {
  heading: {
    marginTop: 20,
    marginBottom: 0
  },
  description: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif'
  },
  formHeading: {
    marginTop: 20
  }
};

export default class YourSchool extends React.Component {
  render() {
    return (
      <div>
        <Notification
          type="bullhorn"
          notice="Something exciting happened"
          details="Here's some more information about the exciting thing"
          dismissible={false}
          buttonText={i18n.learnMore()}
          buttonLink="/blog"
          newWindow={true}
          isRtl={false}
        />
        <h1 style={styles.heading}>
          {i18n.yourSchoolHeading()}
        </h1>
        <h3 style={styles.description}>
          {i18n.yourSchoolDescription()}
        </h3>
        <YourSchoolResources/>
        <h2 style={styles.formHeading}>
          {i18n.yourSchoolTellUs()}
        </h2>
        <CensusForm/>
      </div>
    );
  }
}
