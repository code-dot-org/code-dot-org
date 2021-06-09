import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';
import styleConstants from '../styleConstants';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '../util/color';

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

  /**
   * @param tutorial The specific tutorial the student completed i.e. 'dance', 'dance-2019', etc
   * @returns {string} The category type the specific tutorial belongs to i.e. 'dance', 'applab', etc
   */
  getTutorialType = tutorial =>
    ({
      dance: 'dance',
      'dance-2019': 'dance',
      'applab-intro': 'applab',
      aquatic: '2018Minecraft',
      hero: '2017Minecraft',
      minecraft: 'pre2017Minecraft',
      mc: 'pre2017Minecraft',
      oceans: 'oceans'
    }[tutorial] || 'other');

  /**
   * Renders links to certificate alternatives when there is a special event going on.
   * @param {string} language The language code related to the special event i.e. 'en', 'es', 'ko', etc
   * @param {string} tutorialType The type of lesson the student completed i.e. 'dance', '2018Minecraft', etc
   * @returns {HTMLElement} HTML for rendering the extra certificate links.
   */
  renderExtraCertificateLinks = (language, tutorialType) => {
    let extraLinkUrl, extraLinkText;
    // https://codedotorg.atlassian.net/browse/FND-1604
    // these can be removed after July 25 2021
    if (language === 'ko') {
      switch (tutorialType) {
        case 'oceans':
          extraLinkUrl = pegasus('/files/online-coding-party-2021-oceans.pdf');
          extraLinkText =
            '온라인 코딩 파티 인증서 받으러 가기! (과학기술정보통신부 인증)';
          break;
        case 'dance':
          extraLinkUrl = pegasus('/files/online-coding-party-2021-dance.pdf');
          extraLinkText =
            '온라인 코딩 파티 인증서 받으러 가기! (과학기술정보통신부 인증)';
          break;
      }
    }
    if (!extraLinkUrl || !extraLinkText) {
      // There are no extra links to render.
      return;
    }
    return (
      <div style={styles.extraLinkContainer}>
        <a href={extraLinkUrl} target={'_blank'} style={styles.extraLink}>
          {extraLinkText}
        </a>
      </div>
    );
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
    const tutorialType = this.getTutorialType(tutorial);

    return (
      <div style={styles.container}>
        <Certificate
          tutorial={tutorial}
          certificateId={certificateId}
          randomDonorTwitter={randomDonorTwitter}
          under13={under13}
        >
          {this.renderExtraCertificateLinks(language, tutorialType)}
        </Certificate>
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
  },
  extraLinkContainer: {
    clear: 'both',
    paddingTop: 20
  },
  extraLink: {
    color: color.teal,
    fontSize: 14
  }
};
