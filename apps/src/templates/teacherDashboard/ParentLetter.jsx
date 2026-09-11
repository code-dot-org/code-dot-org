import {Markdown} from '@code-dot-org/markdown';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {LmsLoginTypeNames} from '@cdo/apps/accounts/constants';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {studio, pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {DEMO_SECTION_CODE_PLACEHOLDER} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {
  EmailLinks,
  SectionLoginType,
} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import styles from './ParentLetter.module.scss';

const RESEARCH_ARTICLE_URL =
  'https://medium.com/@codeorg/cs-helps-students-outperform-in-school-college-and-workplace-66dd64a69536';
const ENGAGEMENT_URL =
  'https://support.code.org/hc/en-us/articles/360041539831-How-can-I-keep-track-of-what-my-child-is-working-on-on-Code-org-';

const LOGIN_TYPE_NAMES = {
  [SectionLoginType.clever]: LmsLoginTypeNames.clever,
  [SectionLoginType.google_classroom]: LmsLoginTypeNames.google_classroom,
  [SectionLoginType.picture]: i18n.loginTypePicture().toLowerCase(),
  [SectionLoginType.word]: i18n.loginTypeWordUpdated().toLowerCase(),
  [SectionLoginType.email]: i18n.loginTypePersonal().toLowerCase(),
};

// Plain strings stay out of the markdown parser so a translation is never
// misread as syntax.
const Paragraph = props => (
  <Typography variant="body2" component="p" {...props} />
);

const SectionHeading = props => (
  <Typography
    variant="h4"
    component="h2"
    className={styles.heading}
    {...props}
  />
);

/**
 * A letter that teachers can send home to parents, providing guidance on
 * helping kids continue working on CodeAI at home.
 * Designed to be rendered by itself on a page, ready for printing or PDF
 * generation.
 *
 * The "generic" version of this letter can be displayed by passing only
 * the required props.
 *
 * The letter can be personalized by passing optional props:
 *   studentName
 *   secretPictureUrl
 *   secretWords
 */
class ParentLetter extends React.Component {
  static propTypes = {
    studentId: PropTypes.string,
    autoPrint: PropTypes.bool,
    // Provided by Redux
    section: PropTypes.shape({
      id: PropTypes.number.isRequired,
      loginType: PropTypes.oneOf(Object.values(SectionLoginType)).isRequired,
      code: PropTypes.string,
      demoType: PropTypes.string,
    }).isRequired,
    loginTypeName: PropTypes.string,
    students: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        secretPictureUrl: PropTypes.string,
        secretWords: PropTypes.string,
      })
    ),
    teacherName: PropTypes.string.isRequired,
    logoUrl: PropTypes.string,
  };

  static defaultProps = {
    students: [],
  };

  componentDidMount() {
    if (this.props.autoPrint) {
      print();
    }
  }

  render() {
    const {logoUrl, students, teacherName, section, loginTypeName, studentId} =
      this.props;
    const sectionCode = section.demoType
      ? DEMO_SECTION_CODE_PLACEHOLDER
      : section.code;
    const loginType = section.loginType;
    const student =
      students.length !== 0 && studentId
        ? students
            .filter(student => student.id.toString() === studentId)
            .shift()
        : null;
    const studentName = student ? student.name : 'your student';
    const secretPictureUrl = student ? student.secretPictureUrl : null;
    const secretWords = student ? student.secretWords : null;

    return (
      <div id="printArea">
        <Header logoUrl={logoUrl} />
        <article className={styles.body}>
          <Typography
            variant="h4"
            component="h1"
            className={styles.visuallyHidden}
          >
            {i18n.parentLetterTitle()}
          </Typography>
          <Paragraph>{i18n.parentLetterHello()}</Paragraph>
          <Markdown
            content={i18n.parentLetterIntro({
              homeLink: pegasus('/'),
              studentName: studentName,
            })}
          />
          <ParentLetterSteps
            loginType={loginType}
            loginTypeName={loginTypeName}
            secretPictureUrl={secretPictureUrl}
            secretWords={secretWords}
            sectionCode={sectionCode}
            studentName={studentName}
          />
          <SectionHeading>{i18n.parentLetterWhy()}</SectionHeading>
          <Markdown
            content={i18n.parentLetterWhyDetails({
              researchLink: RESEARCH_ARTICLE_URL,
            })}
          />
          <SectionHeading>{i18n.parentLetterStudentPrivacy()}</SectionHeading>
          <Markdown
            content={i18n.parentLetterStudentPrivacyDetails({
              pledgeLink: EmailLinks.STUDENT_PRIVACY_PLEDGE_URL,
              commonSenseLink: EmailLinks.COMMON_SENSE_MEDIA_URL,
              privacyPolicyLink: EmailLinks.PRIVACY_POLICY_URL,
            })}
          />
          <Paragraph>{i18n.parentLetterClosing()}</Paragraph>
          <Paragraph>{teacherName}</Paragraph>
        </article>
      </div>
    );
  }
}

export const UnconnectedParentLetter = ParentLetter;

export default connect(state => ({
  section:
    state.teacherSections.sections[state.teacherSections.selectedSectionId],
  students: state.teacherSections.selectedStudents,
  teacherName: state.currentUser.userName,
  studentId: queryParams('studentId'),
}))(ParentLetter);

const Header = ({logoUrl = '/shared/images/CodeLogo_White.png'}) => (
  <header className={styles.header}>
    <img src={logoUrl} alt={i18n.codeLogo()} className={styles.logo} />
  </header>
);
Header.propTypes = {
  logoUrl: PropTypes.string,
};

const ParentLetterSteps = ({
  loginType,
  loginTypeName,
  secretPictureUrl,
  secretWords,
  sectionCode,
  studentName,
}) => {
  switch (loginType) {
    case SectionLoginType.lti_v1:
      return (
        <>
          <SectionHeading>{i18n.parentLetterStep1()}</SectionHeading>
          <Markdown
            content={i18n.parentLetterStep1Details({
              engagementLink: ENGAGEMENT_URL,
              videosLink: pegasus(`/educate/resources/videos`),
            })}
          />
          <SectionHeading>{i18n.parentLetterStep2()}</SectionHeading>
          <SignInInstructions
            loginType={loginType}
            loginTypeName={loginTypeName}
            secretPictureUrl={secretPictureUrl}
            secretWords={secretWords}
            sectionCode={sectionCode}
          />
          <Markdown
            content={i18n.parentLetterStep2Details_LMS({
              studentName: studentName,
              loginTypeName: loginTypeName,
            })}
          />
        </>
      );
    default: {
      return (
        <>
          <SectionHeading>{i18n.parentLetterStep1()}</SectionHeading>
          <Markdown
            content={i18n.parentLetterStep1Details({
              engagementLink: ENGAGEMENT_URL,
              videosLink: pegasus(`/educate/resources/videos`),
            })}
          />
          <SectionHeading>{i18n.parentLetterStep2()}</SectionHeading>
          <SignInInstructions
            loginType={loginType}
            loginTypeName={loginTypeName}
            secretPictureUrl={secretPictureUrl}
            secretWords={secretWords}
            sectionCode={sectionCode}
          />
          <Markdown
            content={i18n.parentLetterStep2Details({
              studentName: studentName,
              projectsLink: studio('/projects/public'),
              atHomeLink: pegasus('/athome'),
            })}
          />
          <SectionHeading>{i18n.parentLetterStep3()}</SectionHeading>
          <Markdown
            content={i18n.parentLetterStep3Details({
              accountEditLink: studio('/users/edit'),
            })}
          />
        </>
      );
    }
  }
};
ParentLetterSteps.propTypes = {
  loginType: PropTypes.oneOf(Object.values(SectionLoginType)),
  loginTypeName: PropTypes.string,
  secretPictureUrl: PropTypes.string,
  secretWords: PropTypes.string,
  sectionCode: PropTypes.string,
  studentName: PropTypes.string,
};

const SignInInstructions = ({
  loginType,
  loginTypeName,
  secretPictureUrl,
  secretWords,
  sectionCode,
}) => {
  let steps;
  switch (loginType) {
    case SectionLoginType.lti_v1:
      steps = (
        <ol className={styles.list}>
          <li>
            <Paragraph>
              {i18n.parentLetter_LMS_Step1({loginTypeName: loginTypeName})}
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              {i18n.parentLetter_LMS_Step2({loginTypeName: loginTypeName})}
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              {i18n.parentLetter_LMS_Step3({loginTypeName: loginTypeName})}
            </Paragraph>
          </li>
        </ol>
      );
      break;

    case SectionLoginType.clever:
      steps = (
        <ol className={styles.list}>
          <li>
            <Markdown
              content={i18n.parentLetterClever1({
                cleverLink: 'https://www.clever.com',
              })}
            />
          </li>
          <li>
            <Paragraph>{i18n.parentLetterClever2()}</Paragraph>
            <img
              src="/shared/images/clever_code_org_logo.png"
              alt={i18n.codeLogoClever()}
              className={styles.stepImage}
            />
          </li>
        </ol>
      );
      break;

    case SectionLoginType.google_classroom:
      steps = (
        <ol className={styles.list}>
          <GoToSignIn />
          <li>
            <Paragraph>{i18n.parentLetterGoogle1()}</Paragraph>
          </li>
          <li>
            <Paragraph>{i18n.parentLetterGoogle2()}</Paragraph>
          </li>
        </ol>
      );
      break;

    case SectionLoginType.picture:
      steps = (
        <ol className={styles.list}>
          <GoToSectionSignIn sectionCode={sectionCode} />
          <li>
            <Paragraph>{i18n.parentLetterPicturePassword()}</Paragraph>
            {secretPictureUrl && (
              <img
                src={secretPictureUrl}
                alt={i18n.parentLetterPicturePasswordImg()}
                className={styles.stepImage}
              />
            )}
          </li>
          {!secretPictureUrl && (
            <li>
              <Paragraph>{i18n.parentLetterForgotPicturePassword()}</Paragraph>
            </li>
          )}
        </ol>
      );
      break;

    case SectionLoginType.word:
      steps = (
        <ol className={styles.list}>
          <GoToSectionSignIn sectionCode={sectionCode} />
          <li>
            <Paragraph>
              {i18n.parentLetterSecretWords({
                secretWords: secretWords ? `(${secretWords})` : '',
              })}
            </Paragraph>
          </li>
          {!secretWords && (
            <li>
              <Paragraph>{i18n.parentLetterForgotPassword()}</Paragraph>
            </li>
          )}
        </ol>
      );
      break;

    case SectionLoginType.email:
    default:
      steps = (
        <ol className={styles.list}>
          <GoToSignIn />
          <li>
            <Paragraph>{i18n.parentLetterSignInEmail()}</Paragraph>
          </li>
          <li>
            <Paragraph>{i18n.parentLetterForgotPasswordEmail()}</Paragraph>
          </li>
        </ol>
      );
  }

  if (loginType !== SectionLoginType.lti_v1) {
    loginTypeName = LOGIN_TYPE_NAMES[loginType];
  }
  return (
    <>
      <Markdown
        content={i18n.parentLetterLoginType({
          loginTypeName: loginTypeName,
        })}
      />
      {steps}
    </>
  );
};
SignInInstructions.propTypes = {
  loginType: PropTypes.oneOf(Object.values(SectionLoginType)),
  loginTypeName: PropTypes.string,
  secretPictureUrl: PropTypes.string,
  secretWords: PropTypes.string,
  sectionCode: PropTypes.string, // TODO: Conditional required
};

const GoToSignIn = () => (
  <li>
    <Markdown
      content={i18n.parentLetterSignIn({
        studioLink: studio('/'),
      })}
    />
  </li>
);

const GoToSectionSignIn = ({sectionCode}) => {
  const sectionUrl = studio(`/sections/${sectionCode}`);
  return (
    <li>
      <Markdown
        content={i18n.parentLetterSectionSignIn({
          sectionLink: sectionUrl,
        })}
      />
    </li>
  );
};
GoToSectionSignIn.propTypes = {
  sectionCode: PropTypes.string.isRequired,
};
