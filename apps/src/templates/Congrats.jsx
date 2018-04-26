import React, { PropTypes, Component } from 'react';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';
import styleConstants from '../styleConstants';

const styles = {
  container: {
    width: '100%',
    maxWidth: styleConstants['content-width'],
    marginLeft: 'auto',
    marginRight: 'auto',
  },
};

export default class Congrats extends Component {
  static propTypes = {
    certificateId: PropTypes.string,
    tutorial: PropTypes.string,
    MCShareLink: PropTypes.string,
    userType: PropTypes.oneOf(["signedOut", "teacher", "student"]).isRequired,
    userAge: PropTypes.number,
    isEnglish: PropTypes.bool.isRequired,
    randomDonorTwitter: PropTypes.string,
  };

  render() {
    const {
      tutorial,
      certificateId,
      MCShareLink,
      userType,
      userAge,
      isEnglish,
      randomDonorTwitter
    } = this.props;

    const tutorialType = {
      'applab-intro': 'applab',
      hero: '2017Minecraft',
      minecraft: 'pre2017Minecraft',
      mc: 'pre2017Minecraft',
    }[tutorial] || 'other';

    return (
        <div style={styles.container}>
          <Certificate
            tutorial={tutorial}
            certificateId={certificateId}
            randomDonorTwitter={randomDonorTwitter}
            userAge={userAge}
          />
          {userType === "teacher" && isEnglish && (
            <TeachersBeyondHoc/>
          )}
          <StudentsBeyondHoc
            completedTutorialType={tutorialType}
            MCShareLink={MCShareLink}
            userType={userType}
            userAge={userAge}
            isEnglish={isEnglish}
          />
          {userType === "signedOut" && isEnglish && (
            <TeachersBeyondHoc/>
          )}
        </div>
    );
  }
}
