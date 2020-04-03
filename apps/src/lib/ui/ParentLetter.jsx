import React from 'react';
import PropTypes from 'prop-types';
import {studio, pegasus} from '../util/urlHelpers';
import {SectionLoginType} from '../../util/sharedConstants';
import color from '../../util/color';

const PRIVACY_PLEDGE_URL = 'https://studentprivacypledge.org/signatories/';
const COMMON_SENSE_ARTICLE_URL =
  'https://medium.com/@codeorg/code-orgs-commitment-to-student-privacy-earns-accolades-cae1cca35632';
const ENGAGEMENT_URL =
  'https://support.code.org/hc/en-us/articles/360041539831-How-can-I-keep-track-of-what-my-child-is-working-on-on-Code-org-';

const LOGIN_TYPE_NAMES = {
  [SectionLoginType.clever]: 'Clever accounts',
  [SectionLoginType.google_classroom]: 'Google Classroom accounts',
  [SectionLoginType.picture]: 'picture passwosrds',
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
export default function ParentLetter({
  loginType,
  secretPicturePath,
  secretWords,
  sectionCode,
  studentName,
  teacherName
}) {
  return (
    <div>
      <Header />
      <article>
        <p>Hello!</p>
        <p>
          In my class, your child {studentName} is learning computer science on{' '}
          <a href={pegasus('/')}>Code.org</a>, a fun, creative platform for
          learning computer science and basic coding. Your interest in what your
          child is learning is critical, and Code.org makes it easy to stay
          involved.
        </p>
        <h1>Step 1 - Encourage your child, show interest</h1>
        <p>
          One of the best ways to show your interest is to ask your child to
          explain what they’re learning and show you a project they are proud of
          (<a href={ENGAGEMENT_URL}>details on how to engage your child</a>
          ).
        </p>
        <h1>Step 2 - Get your child set up to use Code.org at home</h1>
        <SignInInstructions
          loginType={loginType}
          secretPicturePath={secretPicturePath}
          secretWords={secretWords}
          sectionCode={sectionCode}
          studentName={studentName}
        />
        <p>
          At the top of their homepage, {studentName || 'your student'} can
          continue the course they are doing with their classroom at school.
          They can also create their own{' '}
          <a href={studio('/projects/public')}>
            games or artwork in the Project Gallery
          </a>{' '}
          or check out <a href={pegasus('/athome')}>code.org/athome</a> for
          ideas for things to work on at home.
        </p>
        <h1>Step 3 - Connect your email to your student’s account</h1>
        <p>
          Keep up to date with what your student is working on and receive
          updates from Code.org.
        </p>
        <ol>
          <li>Have your child sign in to Code.org</li>
          <li>
            Click on the User Menu in the top right corner of the site, then
            click on Account Settings.
          </li>
          <li>
            Scroll down to the section “For Parents and Guardians” and add your
            email address.
          </li>
        </ol>
        <h1>Step 4 - Review Code.org’s privacy policy</h1>
        <p>
          Code.org assigns utmost importance to student safety and security.
          Code.org has signed the{' '}
          <a href={PRIVACY_PLEDGE_URL}>Student Privacy Pledge</a> and their
          privacy practices have received{' '}
          <a href={COMMON_SENSE_ARTICLE_URL}>
            one of the highest overall scores from Common Sense Media
          </a>
          . You can find further details by viewing Code.org’s{' '}
          <a href={pegasus('/privacy')}>Privacy Policy</a>.
        </p>
        <p>
          Computer science teaches students critical thinking, problem solving,
          and digital citizenship, and benefits all students in today’s world,
          no matter what opportunities they pursue in the future.
        </p>
        <p>
          Please let me know if you have any questions and thank you for your
          continued support of your child and of our classroom!
        </p>
        <p>{teacherName}</p>
      </article>
    </div>
  );
}
ParentLetter.propTypes = {
  loginType: PropTypes.oneOf(Object.values(SectionLoginType)).isRequired,
  secretPicturePath: PropTypes.string,
  secretWords: PropTypes.string,
  sectionCode: PropTypes.string, // TODO: Conditionally-required
  studentName: PropTypes.string,
  teacherName: PropTypes.string.isRequired
};

const Header = () => {
  return (
    <header style={styles.header}>
      <img src="/shared/images/CodeLogo_White.png" style={styles.codeOrgLogo} />
    </header>
  );
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
            Have your students log in to their Clever account at{' '}
            <a href="https://www.clever.com/">www.clever.com</a> (click "Sign in
            as a student" at the top right)
          </li>
          <li>
            Click on the Code.org logo on the Clever dashboard. The logo looks
            like this:
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
          <li>Choose 'Sign in with Google'</li>
          <li>Sign in via the Google sign-in dialog</li>
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
            Click on their picture password and then click 'Sign in'
            {secretPicturePath && (
              <span>
                <br />
                <img src={secretPicturePath} style={{width: 60, margin: 10}} />
              </span>
            )}
          </li>
          <li>
            If your student does not remember their picture password, please
            email me and I will provide it
          </li>
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
            Type in their secret words {secretWords && `(${secretWords})`} and
            then click 'Sign in'
          </li>
          <li>
            If your student does not remember their password, please email me
            and I will provide it
          </li>
        </ol>
      );
      break;

    case SectionLoginType.email:
    default:
      steps = (
        <ol>
          <GoToSignIn />
          <li>
            Have them enter their email and password and then click 'Sign in'
          </li>
          <li>
            If your student does not remember their password, they can reset it
            from the sign in screen
          </li>
        </ol>
      );
  }

  const loginTypeName = LOGIN_TYPE_NAMES[loginType];
  return (
    <div>
      <p>
        Our class uses <strong>{loginTypeName}</strong> to sign in. To have your
        student sign in to Code.org at home, do the following:
      </p>
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
    Go to <a href={studio('/')}>{studio('/')}</a> and click 'Sign in'
  </li>
);

const GoToSectionSignIn = ({sectionCode, studentName}) => {
  const sectionUrl = studio(`/sections/${sectionCode}`);
  return (
    <li>
      Go to <a href={sectionUrl}>{sectionUrl}</a> and click on their name
      {studentName && ` (${studentName})`}
    </li>
  );
};
GoToSectionSignIn.propTypes = {
  sectionCode: PropTypes.string.isRequired,
  studentName: PropTypes.string
};

const styles = {
  cleverCodeOrgLogo: {width: 60, margin: 10},
  codeOrgLogo: {height: 30, margin: 15},
  header: {backgroundColor: color.teal, marginBottom: 30}
};
