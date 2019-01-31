import React, { PropTypes, Component } from 'react';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';
import styleConstants from '../styleConstants';
import color from '../util/color';

const styles = {
  container: {
    width: '100%',
    maxWidth: styleConstants['content-width'],
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  extraLinkContainer: {
    clear: 'both',
    paddingTop: 20,
  },
  extraLink: {
    color: color.teal,
  },
};

export default class Congrats extends Component {
  static propTypes = {
    certificateId: PropTypes.string,
    tutorial: PropTypes.string,
    MCShareLink: PropTypes.string,
    userType: PropTypes.oneOf(["signedOut", "teacher", "student"]).isRequired,
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

    const tutorialType = {
      'dance': 'dance',
      'applab-intro': 'applab',
      aquatic: '2018Minecraft',
      hero: '2017Minecraft',
      minecraft: 'pre2017Minecraft',
      mc: 'pre2017Minecraft',
    }[tutorial] || 'other';

    const isMinecraft = /mc|minecraft|hero|aquatic/.test(tutorial);

    // Show a special link to a customizable certificate for users who complete
    // a Minecraft tutorial and are viewing the site in Korean.  The link
    // text we show is in Korean, below.
    const showKoreanMinecraftLink = isMinecraft && language === "ko";

    return (
        <div style={styles.container}>
          <Certificate
            tutorial={tutorial}
            certificateId={certificateId}
            randomDonorTwitter={randomDonorTwitter}
            under13={under13}
            isMinecraft={isMinecraft}
          >
            {showKoreanMinecraftLink && (
              <div style={styles.extraLinkContainer}>
                <a
                  href="http://www.mscodingparty.com/certificate.html"
                  target="_blank"
                  style={styles.extraLink}
                >
                  온라인 코딩 파티 인증서 받으러 가기! (과학기술정보통신부 인증)
                </a>
              </div>
            )}
          </Certificate>
          {userType === "teacher" && isEnglish && (
            <TeachersBeyondHoc/>
          )}
          <StudentsBeyondHoc
            completedTutorialType={tutorialType}
            MCShareLink={MCShareLink}
            userType={userType}
            under13={under13}
            isEnglish={isEnglish}
            hideDancePartyFollowUp={hideDancePartyFollowUp}
          />
          {userType === "signedOut" && isEnglish && (
            <TeachersBeyondHoc/>
          )}
        </div>
    );
  }
}
