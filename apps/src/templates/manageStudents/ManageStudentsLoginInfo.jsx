import {Markdown} from '@code-dot-org/markdown';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import {ParentLetterButtonMetricsCategory} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import MarkdownSteps from '@cdo/apps/templates/teacherDashboard/MarkdownSteps';
import {LtiLogins} from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';
import SignInInstructions from '@cdo/apps/templates/teacherDashboard/SignInInstructions';
import {sectionProviderName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import DownloadParentLetter from './DownloadParentLetter';
import LoginExport from './LoginExport';

import styles from './manageStudentsLoginInfo.module.scss';

const Prose = ({children}) => (
  <Typography variant="body2" component="p">
    {children}
  </Typography>
);

Prose.propTypes = {children: PropTypes.node};

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

    const loginExport = extraProps => (
      <Typography
        variant="body2"
        component="div"
        className={styles.sublistAlign}
      >
        <InlineMarkdown markdown={i18n.loginExportInstructions(extraProps)} />{' '}
        <LoginExport
          sectionCode={sectionCode}
          sectionName={sectionName}
          sectionLoginType={loginType}
          students={this.props.studentData}
        />
      </Typography>
    );

    return (
      <div className={styles.explanation}>
        <Prose>{i18n.setUpClass_childAccountPolicyNotice()}</Prose>
        {loginType !== SectionLoginType.lti_v1 && (
          <Typography variant="h6" component="h2" className={styles.heading}>
            {i18n.setUpClass()}
          </Typography>
        )}
        {loginType === SectionLoginType.word && (
          <>
            <Prose>{i18n.setUpClassWordIntro()}</Prose>
            <MarkdownSteps
              steps={[
                renderStep(i18n.setUpClassWordPic1()),
                renderStep(
                  i18n.setUpClassWord2({
                    printLoginCardLink: teacherDashboardUrl(
                      sectionId,
                      '/login_info'
                    ),
                  })
                ),
              ]}
            />
            {loginExport()}
            <MarkdownSteps
              steps={[privacyLetterStep(), renderStep(i18n.setUpClass4())]}
            />
            <SignInInstructions
              loginType={SectionLoginType.word}
              sectionCode={sectionCode}
              studioUrlPrefix={studioUrlPrefix}
              headingLevel="h3"
            />
          </>
        )}
        {loginType === SectionLoginType.picture && (
          <>
            <Prose>{i18n.setUpClassPicIntro()}</Prose>
            <MarkdownSteps
              steps={[
                renderStep(i18n.setUpClassWordPic1()),
                renderStep(
                  i18n.setUpClassPic2({
                    printLoginCardLink: teacherDashboardUrl(
                      sectionId,
                      '/login_info'
                    ),
                  })
                ),
              ]}
            />
            {loginExport({articleLink: 'support.code.org'})}
            <MarkdownSteps
              steps={[privacyLetterStep(), renderStep(i18n.setUpClass4())]}
            />
            <SignInInstructions
              loginType={SectionLoginType.picture}
              sectionCode={sectionCode}
              studioUrlPrefix={studioUrlPrefix}
              headingLevel="h3"
            />
          </>
        )}
        {loginType === SectionLoginType.email && (
          <>
            <Prose>{i18n.setUpClassEmailIntro()}</Prose>
            <MarkdownSteps
              steps={[
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
              ]}
            />
            <SignInInstructions
              loginType={SectionLoginType.email}
              headingLevel="h3"
            />
          </>
        )}
        {loginType === SectionLoginType.google_classroom && (
          <>
            <Prose>{i18n.setUpClassGoogleIntro()}</Prose>
            <MarkdownSteps
              steps={[
                renderStep(i18n.setUpClassGoogle1()),
                renderStep(i18n.setUpClassGoogle2()),
              ]}
            />
            <Prose>{i18n.setUpClassGoogleFinished()}</Prose>
            <SignInInstructions
              loginType={SectionLoginType.google_classroom}
              headingLevel="h3"
            />
          </>
        )}
        {loginType === SectionLoginType.clever && (
          <>
            <Prose>{i18n.setUpClassCleverIntro()}</Prose>
            <MarkdownSteps
              steps={[
                renderStep(i18n.setUpClassClever1()),
                renderStep(i18n.setUpClassClever2()),
              ]}
            />
            <Prose>{i18n.setUpClassCleverFinished()}</Prose>
            <SignInInstructions
              loginType={SectionLoginType.clever}
              headingLevel="h3"
            />
          </>
        )}
        {loginType === SectionLoginType.classlink && (
          <>
            <Prose>
              To get your class set up with ClassLink, do the following:
            </Prose>
            <MarkdownSteps
              steps={[
                renderStep(
                  '1. Make sure your class is set up the way you want it to be in ClassLink.'
                ),
                renderStep(
                  "2. Click the 'sync students from ClassLink' button above to copy your ClassLink students to CodeAI."
                ),
              ]}
            />
            <Prose>
              You're finished! If you need to add or remove students later, do
              that in ClassLink first, and then sync your classroom again with
              CodeAI.
            </Prose>
            <SignInInstructions
              loginType={SectionLoginType.classlink}
              headingLevel="h3"
            />
          </>
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
