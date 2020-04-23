import PropTypes from 'prop-types';
import React, {Component} from 'react';
import LoginTypeParagraph from '@cdo/apps/templates/teacherDashboard/LoginTypeParagraph';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import googleSignInButton from '../../../static/teacherDashboard/googleSignInButton.png';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {ParentLetterButtonMetricsCategory} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import DownloadParentLetter from './DownloadParentLetter';

const styles = {
  explanation: {
    clear: 'both',
    paddingTop: 20
  },
  heading: {
    color: color.purple
  },
  listAlign: {
    marginLeft: 10
  }
};

class ManageStudentsLoginInfo extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    sectionCode: PropTypes.string,
    loginType: PropTypes.string,
    // The prefix for the code studio url in the current environment,
    // e.g. 'https://studio.code.org' or 'http://localhost-studio.code.org:3000'.
    studioUrlPrefix: PropTypes.string
  };

  render() {
    const {loginType, sectionId, sectionCode, studioUrlPrefix} = this.props;

    return (
      <div style={styles.explanation}>
        <h2 style={styles.heading}>{i18n.setUpClass()}</h2>
        {(loginType === SectionLoginType.word ||
          loginType === SectionLoginType.picture) && (
          <div>
            <p style={styles.listAlign}>{i18n.setUpClassStep1WordPic()}</p>
            {loginType === SectionLoginType.word && (
              <SafeMarkdown
                markdown={i18n.setUpClassStep2Word({
                  printLoginCardLink: teacherDashboardUrl(
                    sectionId,
                    '/login_info'
                  )
                })}
              />
            )}
            {loginType === SectionLoginType.picture && (
              <SafeMarkdown
                markdown={i18n.setUpClassStep2Pic({
                  printLoginCardLink: teacherDashboardUrl(
                    sectionId,
                    '/login_info'
                  )
                })}
              />
            )}
            <SafeMarkdown
              markdown={i18n.setUpClassStep3({
                parentLetterLink: teacherDashboardUrl(
                  sectionId,
                  '/parent_letter'
                )
              })}
            />
            <p style={styles.listAlign}>{i18n.setUpClassStep4()}</p>
          </div>
        )}
        {loginType === SectionLoginType.email && (
          <div>
            <p>
              {i18n.joinSectionAsk()}
              <a
                target="_blank"
                href={`${studioUrlPrefix}/join/${sectionCode}`}
              >
                {`${studioUrlPrefix}/join/${sectionCode}`}
              </a>
            </p>
          </div>
        )}
        {loginType === SectionLoginType.google_classroom && (
          <p>
            {`${i18n.loginInfo_signingInDescription()} ${i18n.loginInfo_signingInGoogle()}`}
            <br />
            <img src={googleSignInButton} style={{maxWidth: '35%'}} />
            <br />
            {i18n.loginInfo_oauthSectionCodes({
              provider: i18n.loginTypeGoogleClassroom()
            })}
          </p>
        )}
        {loginType === SectionLoginType.clever && (
          <p>
            {i18n.loginInfo_signingInClever()}{' '}
            {i18n.loginInfo_oauthSectionCodes({
              provider: i18n.loginTypeClever()
            })}
          </p>
        )}
        <h2 style={styles.heading}>{i18n.loginType()}</h2>
        <LoginTypeParagraph
          sectionId={sectionId}
          onLoginTypeChanged={() => window.location.reload()}
        />
        <h2 style={styles.heading}>{i18n.privacyHeading()}</h2>
        <p id="uitest-privacy-text">{i18n.privacyDocExplanation()}</p>
        <DownloadParentLetter
          sectionId={this.props.sectionId}
          buttonMetricsCategory={ParentLetterButtonMetricsCategory.BELOW_TABLE}
        />
        <br />
        <span id="uitest-privacy-link">
          <SafeMarkdown
            markdown={i18n.privacyLinkToPolicy({
              privacyPolicyLink: pegasus('/privacy/student-privacy')
            })}
          />
        </span>
      </div>
    );
  }
}

export default ManageStudentsLoginInfo;
