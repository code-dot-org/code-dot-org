import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {LmsLoginTypeNames} from '@cdo/apps/accounts/constants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {DEMO_SECTION_CODE_PLACEHOLDER} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {
  EmailLinks,
  SectionLoginType,
} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {queryParams} from '../../code-studio/utils';
import {studio, pegasus} from '../../lib/util/urlHelpers';

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

const Paragraph = props => (
  <Typography variant="body2" component="p" gutterBottom {...props} />
);

const SectionHeading = props => (
  <Typography
    variant="h4"
    component="h2"
    gutterBottom
    className={styles.heading}
    {...props}
  />
);

const ListItem = props => (
  <Typography variant="body2" component="li" {...props} />
);

// The data-* attributes are what SafeMarkdown's default anchor sets; they let
// Localize translate the URL in the browser.
const MarkdownLink = ({children, href, ...props}) => (
  <Link
    {...props}
    href={href}
    className={styles.inlineLink}
    data-lz-url="true"
    data-localize="markdown-url"
  >
    {children}
  </Link>
);
MarkdownLink.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
};

const MarkdownInline = props => <span {...props} />;

// SafeMarkdown caches its processor by map identity, so these live at module
// scope. BLOCK_MARKDOWN is for standalone passages; INLINE_MARKDOWN is for
// markdown inside a ListItem, which already carries the text styling.
const BLOCK_MARKDOWN = {a: MarkdownLink, p: Paragraph};
const INLINE_MARKDOWN = {a: MarkdownLink, p: MarkdownInline};

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
          <Paragraph>{i18n.parentLetterHello()}</Paragraph>
          <SafeMarkdown
            rehypeMap={BLOCK_MARKDOWN}
            markdown={i18n.parentLetterIntro({
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
          <SafeMarkdown
            rehypeMap={BLOCK_MARKDOWN}
            markdown={i18n.parentLetterWhyDetails({
              researchLink: RESEARCH_ARTICLE_URL,
            })}
          />
          <SectionHeading>{i18n.parentLetterStudentPrivacy()}</SectionHeading>
          <SafeMarkdown
            rehypeMap={BLOCK_MARKDOWN}
            markdown={i18n.parentLetterStudentPrivacyDetails({
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
        <div>
          <SectionHeading>{i18n.parentLetterStep1()}</SectionHeading>
          <SafeMarkdown
            rehypeMap={BLOCK_MARKDOWN}
            markdown={i18n.parentLetterStep1Details({
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
            studentName={studentName}
          />
          <SafeMarkdown
            rehypeMap={BLOCK_MARKDOWN}
            markdown={i18n.parentLetterStep2Details_LMS({
              studentName: studentName,
              loginTypeName: loginTypeName,
            })}
          />
        </div>
      );
    default: {
      return (
        <div>
          <SectionHeading>{i18n.parentLetterStep1()}</SectionHeading>
          <SafeMarkdown
            rehypeMap={BLOCK_MARKDOWN}
            markdown={i18n.parentLetterStep1Details({
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
            studentName={studentName}
          />
          <SafeMarkdown
            rehypeMap={BLOCK_MARKDOWN}
            markdown={i18n.parentLetterStep2Details({
              studentName: studentName,
              projectsLink: studio('/projects/public'),
              atHomeLink: pegasus('/athome'),
            })}
          />
          <SectionHeading>{i18n.parentLetterStep3()}</SectionHeading>
          <SafeMarkdown
            rehypeMap={BLOCK_MARKDOWN}
            markdown={i18n.parentLetterStep3Details({
              accountEditLink: studio('/users/edit'),
            })}
          />
        </div>
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
  studentName,
}) => {
  let steps;
  switch (loginType) {
    case SectionLoginType.lti_v1:
      steps = (
        <ol className={styles.list}>
          <ListItem>
            <SafeMarkdown
              rehypeMap={INLINE_MARKDOWN}
              markdown={i18n.parentLetter_LMS_Step1({
                loginTypeName: loginTypeName,
              })}
            />
          </ListItem>
          <ListItem>
            <SafeMarkdown
              rehypeMap={INLINE_MARKDOWN}
              markdown={i18n.parentLetter_LMS_Step2({
                loginTypeName: loginTypeName,
              })}
            />
          </ListItem>
          <ListItem>
            <SafeMarkdown
              rehypeMap={INLINE_MARKDOWN}
              markdown={i18n.parentLetter_LMS_Step3({
                loginTypeName: loginTypeName,
              })}
            />
          </ListItem>
        </ol>
      );
      break;

    case SectionLoginType.clever:
      steps = (
        <ol className={styles.list}>
          <ListItem>
            <SafeMarkdown
              rehypeMap={INLINE_MARKDOWN}
              markdown={i18n.parentLetterClever1({
                cleverLink: 'https://www.clever.com',
              })}
            />
          </ListItem>
          <ListItem>
            {i18n.parentLetterClever2()}
            <img
              src="/shared/images/clever_code_org_logo.png"
              alt={i18n.codeLogoClever()}
              className={styles.stepImage}
            />
          </ListItem>
        </ol>
      );
      break;

    case SectionLoginType.google_classroom:
      steps = (
        <ol className={styles.list}>
          <GoToSignIn />
          <ListItem>{i18n.parentLetterGoogle1()}</ListItem>
          <ListItem>{i18n.parentLetterGoogle2()}</ListItem>
        </ol>
      );
      break;

    case SectionLoginType.picture:
      steps = (
        <ol className={styles.list}>
          <GoToSectionSignIn
            sectionCode={sectionCode}
            studentName={studentName}
          />
          <ListItem>
            {i18n.parentLetterPicturePassword()}
            {secretPictureUrl && (
              <img
                src={secretPictureUrl}
                alt={i18n.parentLetterPicturePasswordImg()}
                className={styles.stepImage}
              />
            )}
          </ListItem>
          {!secretPictureUrl && (
            <ListItem>{i18n.parentLetterForgotPicturePassword()}</ListItem>
          )}
        </ol>
      );
      break;

    case SectionLoginType.word:
      steps = (
        <ol className={styles.list}>
          <GoToSectionSignIn
            sectionCode={sectionCode}
            studentName={studentName}
          />
          <ListItem>
            {i18n.parentLetterSecretWords({
              secretWords: secretWords ? `(${secretWords})` : '',
            })}
          </ListItem>
          {!secretWords && (
            <ListItem>{i18n.parentLetterForgotPassword()}</ListItem>
          )}
        </ol>
      );
      break;

    case SectionLoginType.email:
    default:
      steps = (
        <ol className={styles.list}>
          <GoToSignIn />
          <ListItem>{i18n.parentLetterSignInEmail()}</ListItem>
          <ListItem>{i18n.parentLetterForgotPasswordEmail()}</ListItem>
        </ol>
      );
  }

  if (loginType !== SectionLoginType.lti_v1) {
    loginTypeName = LOGIN_TYPE_NAMES[loginType];
  }
  return (
    <div>
      <SafeMarkdown
        rehypeMap={BLOCK_MARKDOWN}
        markdown={i18n.parentLetterLoginType({
          loginTypeName: loginTypeName,
        })}
      />
      {steps}
    </div>
  );
};
SignInInstructions.propTypes = {
  loginType: PropTypes.oneOf(Object.values(SectionLoginType)),
  loginTypeName: PropTypes.string,
  secretPictureUrl: PropTypes.string,
  secretWords: PropTypes.string,
  sectionCode: PropTypes.string, // TODO: Conditional required
  studentName: PropTypes.string,
};

const GoToSignIn = () => (
  <ListItem>
    <SafeMarkdown
      rehypeMap={INLINE_MARKDOWN}
      markdown={i18n.parentLetterSignIn({
        studioLink: studio('/'),
      })}
    />
  </ListItem>
);

const GoToSectionSignIn = ({sectionCode, studentName}) => {
  const sectionUrl = studio(`/sections/${sectionCode}`);
  return (
    <ListItem>
      <SafeMarkdown
        rehypeMap={INLINE_MARKDOWN}
        markdown={i18n.parentLetterSectionSignIn({
          sectionLink: sectionUrl,
        })}
      />
    </ListItem>
  );
};
GoToSectionSignIn.propTypes = {
  sectionCode: PropTypes.string.isRequired,
  studentName: PropTypes.string,
};
