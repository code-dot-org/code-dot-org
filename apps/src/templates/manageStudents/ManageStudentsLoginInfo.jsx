import {Markdown} from '@code-dot-org/markdown';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import {ParentLetterButtonMetricsCategory} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {LtiLogins} from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';
import SignInInstructions from '@cdo/apps/templates/teacherDashboard/SignInInstructions';
import {sectionProviderName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import DownloadParentLetter from './DownloadParentLetter';
import LoginExport from './LoginExport';

import styles from './manageStudentsLoginInfo.module.scss';

// Every step string is a markdown list item ("1. ..."). A contiguous run is
// joined into one source string so it renders as a single <ol>; rendering each
// step on its own would make every step a one-item list.
const renderSteps = steps => (
  <Markdown content={steps.filter(Boolean).join('\n\n')} />
);

class ManageStudentsLoginInfo extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    sectionCode: PropTypes.string,
    sectionName: PropTypes.string,
    loginType: PropTypes.oneOf(Object.values(SectionLoginType)).isRequired,
    studentData: PropTypes.array,
    providePrivacyLetter: PropTypes.bool,
    // The prefix for the code studio url in the current environment,
    // e.g. 'https://studio.code.org' or 'http://localhost-studio.code.org:3000'.
    studioUrlPrefix: PropTypes.string,

    // Provided by Redux
    sectionProviderName: PropTypes.string,
  };

  render() {
    const {
      loginType,
      sectionId,
      sectionCode,
      sectionName,
      studioUrlPrefix,
      providePrivacyLetter,
    } = this.props;

    const ParentLetterAndStudentPrivacyInfo = () => (
      <>
        <Typography variant="h6" component="h2" className={styles.heading}>
          {i18n.privacyHeading()}
        </Typography>
        <Typography variant="body2" component="p" id="uitest-privacy-text">
          {i18n.privacyDocExplanation()}
        </Typography>
        <div className={styles.parentLetterButton}>
          <DownloadParentLetter
            sectionId={this.props.sectionId}
            buttonMetricsCategory={
              ParentLetterButtonMetricsCategory.BELOW_TABLE
            }
          />
        </div>
        <div id="uitest-privacy-link">
          <Markdown
            content={i18n.privacyLinkToPolicy({
              privacyPolicyLink: pegasus('/privacy/student-privacy'),
            })}
          />
        </div>
      </>
    );

    // Keep track of the steps and ensure the string starts with the appropriate
    // step number (1., 2., 3., and so on)
    let counter = [0];
    const renderStep = message => {
      return message.replace(/^\d./, `${++counter[0]}.`);
    };

    const privacyLetterStep = () =>
      providePrivacyLetter &&
      renderStep(
        i18n.setUpClass3({
          parentLetterLink: teacherDashboardUrl(sectionId, '/parent_letter'),
        })
      );

    return (
      <div className={styles.explanation}>
        <Typography variant="body2" component="p">
          {i18n.setUpClass_childAccountPolicyNotice()}
        </Typography>
        {loginType !== SectionLoginType.lti_v1 && (
          <Typography variant="h6" component="h2" className={styles.heading}>
            {i18n.setUpClass()}
          </Typography>
        )}
        {loginType === SectionLoginType.word && (
          <div>
            <Typography variant="body2" component="p">
              {i18n.setUpClassWordIntro()}
            </Typography>
            {renderSteps([
              renderStep(i18n.setUpClassWordPic1()),
              renderStep(
                i18n.setUpClassWord2({
                  printLoginCardLink: teacherDashboardUrl(
                    sectionId,
                    '/login_info'
                  ),
                })
              ),
            ])}
            <Typography
              variant="body2"
              component="div"
              className={styles.sublistAlign}
            >
              <InlineMarkdown markdown={i18n.loginExportInstructions()} />{' '}
              <LoginExport
                sectionCode={sectionCode}
                sectionName={sectionName}
                sectionLoginType={loginType}
                students={this.props.studentData}
              />
            </Typography>
            {renderSteps([privacyLetterStep(), renderStep(i18n.setUpClass4())])}
            <SignInInstructions
              loginType={SectionLoginType.word}
              sectionCode={sectionCode}
              studioUrlPrefix={studioUrlPrefix}
            />
          </div>
        )}
        {loginType === SectionLoginType.picture && (
          <div>
            <Typography variant="body2" component="p">
              {i18n.setUpClassPicIntro()}
            </Typography>
            {renderSteps([
              renderStep(i18n.setUpClassWordPic1()),
              renderStep(
                i18n.setUpClassPic2({
                  printLoginCardLink: teacherDashboardUrl(
                    sectionId,
                    '/login_info'
                  ),
                })
              ),
            ])}
            <Typography
              variant="body2"
              component="div"
              className={styles.sublistAlign}
            >
              <InlineMarkdown
                markdown={i18n.loginExportInstructions({
                  articleLink: 'support.code.org',
                })}
              />{' '}
              <LoginExport
                sectionCode={sectionCode}
                sectionName={sectionName}
                sectionLoginType={loginType}
                students={this.props.studentData}
              />
            </Typography>
            {renderSteps([privacyLetterStep(), renderStep(i18n.setUpClass4())])}
            <SignInInstructions
              loginType={SectionLoginType.picture}
              sectionCode={sectionCode}
              studioUrlPrefix={studioUrlPrefix}
            />
          </div>
        )}
        {loginType === SectionLoginType.email && (
          <div>
            <Typography variant="body2" component="p">
              {i18n.setUpClassEmailIntro()}
            </Typography>
            {renderSteps([
              renderStep(
                i18n.setUpClassEmail1({
                  createAccountLink: `${studioUrlPrefix}/users/sign_up/account_type`,
                })
              ),
              renderStep(
                i18n.setUpClassEmail2({
                  joinLink: `${studioUrlPrefix}/join/${sectionCode}`,
                })
              ),
              privacyLetterStep(),
              renderStep(i18n.setUpClass4()),
            ])}
            <SignInInstructions loginType={SectionLoginType.email} />
          </div>
        )}
        {loginType === SectionLoginType.google_classroom && (
          <div>
            <Typography variant="body2" component="p">
              {i18n.setUpClassGoogleIntro()}
            </Typography>
            {renderSteps([
              renderStep(i18n.setUpClassGoogle1()),
              renderStep(i18n.setUpClassGoogle2()),
            ])}
            <Typography variant="body2" component="p">
              {i18n.setUpClassGoogleFinished()}
            </Typography>
            <SignInInstructions loginType={SectionLoginType.google_classroom} />
          </div>
        )}
        {loginType === SectionLoginType.clever && (
          <div>
            <Typography variant="body2" component="p">
              {i18n.setUpClassCleverIntro()}
            </Typography>
            {renderSteps([
              renderStep(i18n.setUpClassClever1()),
              renderStep(i18n.setUpClassClever2()),
            ])}
            <Typography variant="body2" component="p">
              {i18n.setUpClassCleverFinished()}
            </Typography>
            <SignInInstructions loginType={SectionLoginType.clever} />
          </div>
        )}
        {loginType === SectionLoginType.lti_v1 && (
          <LtiLogins sectionProviderName={this.props.sectionProviderName} />
        )}
        {providePrivacyLetter && <ParentLetterAndStudentPrivacyInfo />}
      </div>
    );
  }
}

export const UnconnectedManageStudentsLoginInfo = ManageStudentsLoginInfo;
export default connect((state, props) => ({
  sectionProviderName: sectionProviderName(state, props.sectionId),
}))(ManageStudentsLoginInfo);
