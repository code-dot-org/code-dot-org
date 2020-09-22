import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {studio, pegasus} from '../util/urlHelpers';
import {SectionLoginType} from '../../util/sharedConstants';
import {queryParams} from '../../code-studio/utils';
import color from '../../util/color';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const PRIVACY_PLEDGE_URL = 'https://studentprivacypledge.org/signatories/';
const COMMON_SENSE_ARTICLE_URL =
  'https://medium.com/@codeorg/code-orgs-commitment-to-student-privacy-earns-accolades-cae1cca35632';
const RESEARCH_ARTICLE_URL =
  'https://medium.com/@codeorg/cs-helps-students-outperform-in-school-college-and-workplace-66dd64a69536';
const ENGAGEMENT_URL =
  'https://support.code.org/hc/en-us/articles/360041539831-How-can-I-keep-track-of-what-my-child-is-working-on-on-Code-org-';

const LOGIN_TYPE_NAMES = {
  [SectionLoginType.clever]: 'Clever accounts',
  [SectionLoginType.google_classroom]: 'Google Classroom accounts',
  [SectionLoginType.picture]: 'picture passwords',
  [SectionLoginType.word]: 'secret words',
  [SectionLoginType.email]: 'personal logins'
};

/**
 * A letter that teachers can send home to parents, providing guidance on
 * helping kids continue working on Code.org at home.
 * Designed to be rendered by itself on a page, ready for printing or PDF
 * generation.
 *
 * The "generic" version of this letter can be displayed by passing only
 * the required props.
 *
 * The letter can be personalized by passing optional props:
 *   studentName
 *   secretPicturePath
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
      code: PropTypes.string.isRequired
    }).isRequired,
    students: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        secret_picture_path: PropTypes.string,
        secret_words: PropTypes.string
      })
    ),
    teacherName: PropTypes.string.isRequired,
    logoUrl: PropTypes.string
  };

  static defaultProps = {
    students: []
  };

  componentDidMount() {
    if (this.props.autoPrint) {
      print();
    }
  }

  render() {
    const {logoUrl, students, teacherName, section, studentId} = this.props;
    const sectionCode = section.code;
    const loginType = section.loginType;
    const student =
      students.length !== 0 && studentId
        ? students
            .filter(student => student.id.toString() === studentId)
            .shift()
        : null;
    const studentName = student ? student.name : 'your student';
    const secretPicturePath = student ? student.secret_picture_path : null;
    const secretWords = student ? student.secret_words : null;

    return (
      <div id="printArea">
        <Header logoUrl={logoUrl} />
        <article>
          <p>{i18n.parentLetterHello()}</p>
          <SafeMarkdown
            markdown={i18n.parentLetterIntro({
              homeLink: pegasus('/'),
              studentName: studentName
            })}
          />
          <h1>{i18n.parentLetterStep1()}</h1>
          <SafeMarkdown
            markdown={i18n.parentLetterStep1Details({
              engagementLink: ENGAGEMENT_URL,
              videosLink: pegasus(`/educate/resources/videos`)
            })}
          />
          <h1>{i18n.parentLetterStep2()}</h1>
          <SignInInstructions
            loginType={loginType}
            secretPicturePath={secretPicturePath}
            secretWords={secretWords}
            sectionCode={sectionCode}
            studentName={studentName}
          />
          <SafeMarkdown
            markdown={i18n.parentLetterStep2Details({
              studentName: studentName,
              projectsLink: studio('/projects/public'),
              atHomeLink: pegasus('/athome')
            })}
          />
          <h1>{i18n.parentLetterStep3()}</h1>
          <SafeMarkdown
            markdown={i18n.parentLetterStep3Details({
              accountEditLink: studio('/users/edit')
            })}
          />
          <h1>{i18n.parentLetterWhy()}</h1>
          <SafeMarkdown
            markdown={i18n.parentLetterWhyDetails({
              researchLink: RESEARCH_ARTICLE_URL
            })}
          />
          <h1>{i18n.parentLetterStudentPrivacy()}</h1>
          <SafeMarkdown
            markdown={i18n.parentLetterStudentPrivacyDetails({
              pledgeLink: PRIVACY_PLEDGE_URL,
              commonSenseLink: COMMON_SENSE_ARTICLE_URL,
              privacyPolicyLink: pegasus('/privacy/student-privacy')
            })}
          />
          <p>{i18n.parentLetterClosing()}</p>
          <p>{teacherName}</p>
        </article>
      </div>
    );
  }
}

export const UnconnectedParentLetter = ParentLetter;

export default connect(state => ({
  section:
    state.teacherSections.sections[state.teacherSections.selectedSectionId],
  students: state.sectionData.section.students,
  teacherName: state.currentUser.userName,
  studentId: queryParams('studentId')
}))(ParentLetter);

const Header = ({logoUrl}) => {
  return (
    <header style={styles.header}>
      <img src={logoUrl} style={styles.codeOrgLogo} />
    </header>
  );
};
Header.propTypes = {
  logoUrl: PropTypes.string.isRequired
};
Header.defaultProps = {
  logoUrl: '/shared/images/CodeLogo_White.png'
};

const SignInInstructions = ({
  loginType,
  secretPicturePath,
  secretWords,
  sectionCode,
  studentName
}) => {
  let steps;
  switch (loginType) {
    case SectionLoginType.clever:
      steps = (
        <ol>
          <li>
            <SafeMarkdown
              markdown={i18n.parentLetterClever1({
                cleverLink: 'https://www.clever.com'
              })}
            />
          </li>
          <li>
            {i18n.parentLetterClever2()}
            <br />
            <img
              src="/shared/images/clever_code_org_logo.png"
              style={styles.cleverCodeOrgLogo}
            />
          </li>
        </ol>
      );
      break;

    case SectionLoginType.google_classroom:
      steps = (
        <ol>
          <GoToSignIn />
          <li>{i18n.parentLetterGoogle1()}</li>
          <li>{i18n.parentLetterGoogle2()}</li>
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
            {i18n.parentLetterPicturePassword()}
            {secretPicturePath && (
              <span>
                <br />
                <img
                  src={pegasus(`/images/${secretPicturePath}`)}
                  style={{width: 60, margin: 10}}
                />
              </span>
            )}
          </li>
          {!secretPicturePath && (
            <li>{i18n.parentLetterForgotPicturePassword()}</li>
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
            <p>
              {i18n.parentLetterSecretWords({
                secretWords: secretWords ? `(${secretWords})` : ''
              })}
            </p>
          </li>
          {!secretWords && <li>{i18n.parentLetterForgotPassword()}</li>}
        </ol>
      );
      break;

    case SectionLoginType.email:
    default:
      steps = (
        <ol>
          <GoToSignIn />
          <li>{i18n.parentLetterSignInEmail()}</li>
          <li>{i18n.parentLetterForgotPasswordEmail()}</li>
        </ol>
      );
  }

  const loginTypeName = LOGIN_TYPE_NAMES[loginType];
  return (
    <div>
      <SafeMarkdown
        markdown={i18n.parentLetterLoginType({
          loginTypeName: loginTypeName
        })}
      />
      {steps}
    </div>
  );
};
SignInInstructions.propTypes = {
  loginType: PropTypes.oneOf(Object.values(SectionLoginType)),
  secretPicturePath: PropTypes.string,
  secretWords: PropTypes.string,
  sectionCode: PropTypes.string, // TODO: Conditional required
  studentName: PropTypes.string
};

const GoToSignIn = () => (
  <li>
    <SafeMarkdown
      markdown={i18n.parentLetterSignIn({
        studioLink: studio('/')
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
          sectionLink: sectionUrl
        })}
      />
    </li>
  );
};
GoToSectionSignIn.propTypes = {
  sectionCode: PropTypes.string.isRequired,
  studentName: PropTypes.string
};

const styles = {
  cleverCodeOrgLogo: {width: 60, margin: 10},
  codeOrgLogo: {height: 42, margin: '4px 16px'},
  header: {backgroundColor: color.teal, marginBottom: 30}
};
