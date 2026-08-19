import {EmailLinks, SectionLoginType} from '@code-dot-org/shared-constants';
import {Box, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {LmsLoginTypeNames} from '@cdo/apps/accounts/constants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {DEMO_SECTION_CODE_PLACEHOLDER} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import i18n from '@cdo/locale';

import {queryParams} from '../../code-studio/utils';
import {studio, pegasus} from '../../lib/util/urlHelpers';

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
      <Box id="printArea">
        <Header logoUrl={logoUrl} />
        <Box component="article">
          <Typography component="p">{i18n.parentLetterHello()}</Typography>
          <SafeMarkdown
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
          <Typography variant="h1">{i18n.parentLetterWhy()}</Typography>
          <SafeMarkdown
            markdown={i18n.parentLetterWhyDetails({
              researchLink: RESEARCH_ARTICLE_URL,
            })}
          />
          <Typography variant="h1">
            {i18n.parentLetterStudentPrivacy()}
          </Typography>
          <SafeMarkdown
            markdown={i18n.parentLetterStudentPrivacyDetails({
              pledgeLink: EmailLinks.STUDENT_PRIVACY_PLEDGE_URL,
              commonSenseLink: EmailLinks.COMMON_SENSE_MEDIA_URL,
              privacyPolicyLink: EmailLinks.PRIVACY_POLICY_URL,
            })}
          />
          <Typography component="p">{i18n.parentLetterClosing()}</Typography>
          <Typography component="p">{teacherName}</Typography>
        </Box>
      </Box>
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
  <Box
    component="header"
    sx={{backgroundColor: 'primary.main', marginBottom: 3.75}}
  >
    <Box
      component="img"
      src={logoUrl}
      alt={i18n.codeLogo()}
      sx={{height: 42, margin: '4px 16px'}}
    />
  </Box>
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
        <Box>
          <Typography variant="h1">{i18n.parentLetterStep1()}</Typography>
          <SafeMarkdown
            markdown={i18n.parentLetterStep1Details({
              engagementLink: ENGAGEMENT_URL,
              videosLink: pegasus(`/educate/resources/videos`),
            })}
          />
          <Typography variant="h1">{i18n.parentLetterStep2()}</Typography>
          <SignInInstructions
            loginType={loginType}
            loginTypeName={loginTypeName}
            secretPictureUrl={secretPictureUrl}
            secretWords={secretWords}
            sectionCode={sectionCode}
            studentName={studentName}
          />
          <SafeMarkdown
            markdown={i18n.parentLetterStep2Details_LMS({
              studentName: studentName,
              loginTypeName: loginTypeName,
            })}
          />
        </Box>
      );
    default: {
      return (
        <Box>
          <Typography variant="h1">{i18n.parentLetterStep1()}</Typography>
          <SafeMarkdown
            markdown={i18n.parentLetterStep1Details({
              engagementLink: ENGAGEMENT_URL,
              videosLink: pegasus(`/educate/resources/videos`),
            })}
          />
          <Typography variant="h1">{i18n.parentLetterStep2()}</Typography>
          <SignInInstructions
            loginType={loginType}
            loginTypeName={loginTypeName}
            secretPictureUrl={secretPictureUrl}
            secretWords={secretWords}
            sectionCode={sectionCode}
            studentName={studentName}
          />
          <SafeMarkdown
            markdown={i18n.parentLetterStep2Details({
              studentName: studentName,
              projectsLink: studio('/projects/public'),
              atHomeLink: pegasus('/athome'),
            })}
          />
          <Typography variant="h1">{i18n.parentLetterStep3()}</Typography>
          <SafeMarkdown
            markdown={i18n.parentLetterStep3Details({
              accountEditLink: studio('/users/edit'),
            })}
          />
        </Box>
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
        <ol>
          <li>
            <SafeMarkdown
              markdown={i18n.parentLetter_LMS_Step1({
                loginTypeName: loginTypeName,
              })}
            />
          </li>
          <li>
            <SafeMarkdown
              markdown={i18n.parentLetter_LMS_Step2({
                loginTypeName: loginTypeName,
              })}
            />
          </li>
          <li>
            <SafeMarkdown
              markdown={i18n.parentLetter_LMS_Step3({
                loginTypeName: loginTypeName,
              })}
            />
          </li>
        </ol>
      );
      break;

    case SectionLoginType.clever:
      steps = (
        <ol>
          <li>
            <SafeMarkdown
              markdown={i18n.parentLetterClever1({
                cleverLink: 'https://www.clever.com',
              })}
            />
          </li>

          <li>
            <Typography component="span">
              {i18n.parentLetterClever2()}
            </Typography>
            <br />
            <Box
              component="img"
              src="/shared/images/clever_code_org_logo.png"
              alt={i18n.codeLogoClever()}
              sx={{width: 60, margin: '10px'}}
            />
          </li>
        </ol>
      );
      break;

    case SectionLoginType.google_classroom:
      steps = (
        <ol>
          <GoToSignIn />
          <li>
            <Typography component="span">
              {i18n.parentLetterGoogle1()}
            </Typography>
          </li>
          <li>
            <Typography component="span">
              {i18n.parentLetterGoogle2()}
            </Typography>
          </li>
        </ol>
      );
      break;

    case SectionLoginType.picture:
      steps = (
        <ol>
          <GoToSectionSignIn
            sectionCode={sectionCode}
            studentName={studentName}
          />
          <li>
            <Typography component="span">
              {i18n.parentLetterPicturePassword()}
            </Typography>
            {secretPictureUrl && (
              <span>
                <br />
                <Box
                  component="img"
                  src={secretPictureUrl}
                  alt={i18n.parentLetterPicturePasswordImg()}
                  sx={{width: 60, margin: '10px'}}
                />
              </span>
            )}
          </li>
          {!secretPictureUrl && (
            <li>
              <Typography component="span">
                {i18n.parentLetterForgotPicturePassword()}
              </Typography>
            </li>
          )}
        </ol>
      );
      break;

    case SectionLoginType.word:
      steps = (
        <ol>
          <GoToSectionSignIn
            sectionCode={sectionCode}
            studentName={studentName}
          />
          <li>
            <Typography component="p">
              {i18n.parentLetterSecretWords({
                secretWords: secretWords ? `(${secretWords})` : '',
              })}
            </Typography>
          </li>
          {!secretWords && (
            <li>
              <Typography component="span">
                {i18n.parentLetterForgotPassword()}
              </Typography>
            </li>
          )}
        </ol>
      );
      break;

    case SectionLoginType.email:
    default:
      steps = (
        <ol>
          <GoToSignIn />
          <li>
            <Typography component="span">
              {i18n.parentLetterSignInEmail()}
            </Typography>
          </li>
          <li>
            <Typography component="span">
              {i18n.parentLetterForgotPasswordEmail()}
            </Typography>
          </li>
        </ol>
      );
  }

  if (loginType !== SectionLoginType.lti_v1) {
    loginTypeName = LOGIN_TYPE_NAMES[loginType];
  }
  return (
    <Box>
      <SafeMarkdown
        markdown={i18n.parentLetterLoginType({
          loginTypeName: loginTypeName,
        })}
      />
      {steps}
    </Box>
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
  <li>
    <SafeMarkdown
      markdown={i18n.parentLetterSignIn({
        studioLink: studio('/'),
      })}
    />
  </li>
);

const GoToSectionSignIn = ({sectionCode, studentName}) => {
  const sectionUrl = studio(`/sections/${sectionCode}`);
  return (
    <li>
      <SafeMarkdown
        markdown={i18n.parentLetterSectionSignIn({
          sectionLink: sectionUrl,
        })}
      />
    </li>
  );
};
GoToSectionSignIn.propTypes = {
  sectionCode: PropTypes.string.isRequired,
  studentName: PropTypes.string,
};
