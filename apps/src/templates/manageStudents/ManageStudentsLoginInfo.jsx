import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import {ParentLetterButtonMetricsCategory} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import DownloadParentLetter from './DownloadParentLetter';
import SignInInstructions from '@cdo/apps/templates/teacherDashboard/SignInInstructions';

import LoginExport from './LoginExport';

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
  },
  sublistAlign: {
    marginLeft: 20,
    marginBottom: 10
  }
};

class ManageStudentsLoginInfo extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    sectionCode: PropTypes.string,
    sectionName: PropTypes.string,
    loginType: PropTypes.oneOf(Object.values(SectionLoginType)).isRequired,
    studentData: PropTypes.array,
    // The prefix for the code studio url in the current environment,
    // e.g. 'https://studio.code.org' or 'http://localhost-studio.code.org:3000'.
    studioUrlPrefix: PropTypes.string
  };

  render() {
    const {
      loginType,
      sectionId,
      sectionCode,
      sectionName,
      studioUrlPrefix
    } = this.props;

    return (
      <div style={styles.explanation}>
        <h2 style={styles.heading}>{i18n.setUpClass()}</h2>
        {loginType === SectionLoginType.word && (
          <div>
            <p>{i18n.setUpClassWordIntro()}</p>
            <p style={styles.listAlign}>{i18n.setUpClassWordPic1()}</p>
            <SafeMarkdown
              markdown={i18n.setUpClassWord2({
                printLoginCardLink: teacherDashboardUrl(
                  sectionId,
                  '/login_info'
                )
              })}
            />
            <div style={styles.sublistAlign}>
              <InlineMarkdown markdown={i18n.loginExportInstructions()} />{' '}
              <LoginExport
                sectionCode={sectionCode}
                sectionName={sectionName}
                sectionLoginType={loginType}
                students={this.props.studentData}
              />
            </div>
            <SafeMarkdown
              markdown={i18n.setUpClass3({
                parentLetterLink: teacherDashboardUrl(
                  sectionId,
                  '/parent_letter'
                )
              })}
            />
            <p style={styles.listAlign}>{i18n.setUpClass4()}</p>
            <SignInInstructions
              loginType={SectionLoginType.word}
              sectionCode={sectionCode}
              studioUrlPrefix={studioUrlPrefix}
            />
          </div>
        )}
        {loginType === SectionLoginType.picture && (
          <div>
            <p>{i18n.setUpClassPicIntro()}</p>
            <p style={styles.listAlign}>{i18n.setUpClassWordPic1()}</p>
            <SafeMarkdown
              markdown={i18n.setUpClassPic2({
                printLoginCardLink: teacherDashboardUrl(
                  sectionId,
                  '/login_info'
                )
              })}
            />
            <div style={styles.sublistAlign}>
              <InlineMarkdown
                markdown={i18n.loginExportInstructions({
                  articleLink: 'support.code.org'
                })}
              />{' '}
              <LoginExport
                sectionCode={sectionCode}
                sectionName={sectionName}
                sectionLoginType={loginType}
                students={this.props.studentData}
              />
            </div>
            <SafeMarkdown
              markdown={i18n.setUpClass3({
                parentLetterLink: teacherDashboardUrl(
                  sectionId,
                  '/parent_letter'
                )
              })}
            />
            <p style={styles.listAlign}>{i18n.setUpClass4()}</p>
            <SignInInstructions
              loginType={SectionLoginType.picture}
              sectionCode={sectionCode}
              studioUrlPrefix={studioUrlPrefix}
            />
          </div>
        )}
        {loginType === SectionLoginType.email && (
          <div>
            <p>{i18n.setUpClassEmailIntro()}</p>
            <SafeMarkdown
              markdown={i18n.setUpClassEmail1({
                createAccountLink: `${studioUrlPrefix}/users/sign_up`
              })}
            />
            <SafeMarkdown
              markdown={i18n.setUpClassEmail2({
                joinLink: `${studioUrlPrefix}/join/${sectionCode}`
              })}
            />
            <SafeMarkdown
              markdown={i18n.setUpClass3({
                parentLetterLink: teacherDashboardUrl(
                  sectionId,
                  '/parent_letter'
                )
              })}
            />
            <p style={styles.listAlign}>{i18n.setUpClass4()}</p>
            <SignInInstructions loginType={SectionLoginType.email} />
          </div>
        )}
        {loginType === SectionLoginType.google_classroom && (
          <div>
            <p>{i18n.setUpClassGoogleIntro()}</p>
            <p style={styles.listAlign}>{i18n.setUpClassGoogle1()}</p>
            <p style={styles.listAlign}>{i18n.setUpClassGoogle2()}</p>
            <p>{i18n.setUpClassGoogleFinished()}</p>
            <SignInInstructions loginType={SectionLoginType.google_classroom} />
          </div>
        )}
        {loginType === SectionLoginType.clever && (
          <div>
            <p>{i18n.setUpClassCleverIntro()}</p>
            <p style={styles.listAlign}>{i18n.setUpClassClever1()}</p>
            <p style={styles.listAlign}>{i18n.setUpClassClever2()}</p>
            <p>{i18n.setUpClassCleverFinished()}</p>
            <SignInInstructions loginType={SectionLoginType.clever} />
          </div>
        )}
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
