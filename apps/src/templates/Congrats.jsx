import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';
import styleConstants from '../styleConstants';

export default class Congrats extends Component {
  static propTypes = {
    certificateId: PropTypes.string,
    tutorial: PropTypes.string,
    MCShareLink: PropTypes.string,
    userType: PropTypes.oneOf(['signedOut', 'teacher', 'student']).isRequired,
    under13: PropTypes.bool,
    language: PropTypes.string.isRequired,
    randomDonorTwitter: PropTypes.string,
    hideDancePartyFollowUp: PropTypes.bool
  };

  render() {
    const {
      tutorial,
      certificateId,
      MCShareLink,
      userType,
      under13,
      language,
      randomDonorTwitter,
      hideDancePartyFollowUp
    } = this.props;

    const isEnglish = language === 'en';

    const tutorialType =
      {
        dance: 'dance',
        'dance-2019': 'dance',
        'applab-intro': 'applab',
        aquatic: '2018Minecraft',
        hero: '2017Minecraft',
        minecraft: 'pre2017Minecraft',
        mc: 'pre2017Minecraft'
      }[tutorial] || 'other';

    return (
      <div style={styles.container}>
        <Certificate
          tutorial={tutorial}
          certificateId={certificateId}
          randomDonorTwitter={randomDonorTwitter}
          under13={under13}
        />
        {userType === 'teacher' && isEnglish && <TeachersBeyondHoc />}
        <StudentsBeyondHoc
          completedTutorialType={tutorialType}
          MCShareLink={MCShareLink}
          userType={userType}
          under13={under13}
          isEnglish={isEnglish}
          hideDancePartyFollowUp={hideDancePartyFollowUp}
        />
        {userType === 'signedOut' && isEnglish && <TeachersBeyondHoc />}
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    maxWidth: styleConstants['content-width'],
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};
