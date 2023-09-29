import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {PrintLoginCardsButtonMetricsCategory} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import PrintLoginCards from '@cdo/apps/templates/manageStudents/PrintLoginCards';
import SignInInstructions from '@cdo/apps/templates/teacherDashboard/SignInInstructions';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import oauthSignInButtons from '../../../static/teacherDashboard/oauthSignInButtons.png';
import syncGoogleClassroom from '../../../static/teacherDashboard/syncGoogleClassroom.png';
import syncClever from '../../../static/teacherDashboard/syncClever.png';
import {queryParams} from '@cdo/apps/code-studio/utils';

const getManageStudentsUrl = sectionId => {
  return `/teacher_dashboard/sections/${sectionId}/manage_students`;
};

/**
 * Rendered from the /login_info route in teacher dashboard.
 * Gives teachers information about signing in, allowing students to join their section, and prints
 * login cards for word/picture sections.
 */
class SectionLoginInfo extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string.isRequired,

    // Provided by redux.
    section: PropTypes.shape({
      id: PropTypes.number.isRequired,
      loginType: PropTypes.string.isRequired,
      code: PropTypes.string,
    }).isRequired,
    students: PropTypes.array.isRequired,
  };

  render() {
    const {studioUrlPrefix, section} = this.props;
    const singleStudentId = queryParams('studentId');
    const autoPrint = !!singleStudentId || !!queryParams('autoPrint');
    const students = singleStudentId
      ? this.props.students.filter(
          student => student.id.toString() === singleStudentId
        )
      : this.props.students;

    return (
      <div>
        {[SectionLoginType.word, SectionLoginType.picture].includes(
          section.loginType
        ) && (
          <WordOrPictureLogins
            studioUrlPrefix={studioUrlPrefix}
            section={section}
            students={students}
            autoPrint={autoPrint}
            loginType={section.loginType}
          />
        )}
        {section.loginType === SectionLoginType.email && (
          <EmailLogins
            studioUrlPrefix={studioUrlPrefix}
            sectionCode={section.code}
            sectionId={section.id}
          />
        )}
        {[SectionLoginType.google_classroom, SectionLoginType.clever].includes(
          section.loginType
        ) && (
          <OAuthLogins sectionId={section.id} loginType={section.loginType} />
        )}
      </div>
    );
  }
}

export const UnconnectedSectionLoginInfo = SectionLoginInfo;

export default connect(state => ({
  section:
    state.teacherSections.sections[state.teacherSections.selectedSectionId],
  students: state.teacherSections.selectedStudents,
}))(SectionLoginInfo);

class OAuthLogins extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    loginType: PropTypes.oneOf([
      SectionLoginType.google_classroom,
      SectionLoginType.clever,
    ]).isRequired,
  };

  render() {
    const {sectionId, loginType} = this.props;
    let loginTypeLabel = '';
    let syncSectionImgSrc = '';
    if (loginType === SectionLoginType.google_classroom) {
      loginTypeLabel = i18n.loginTypeGoogleClassroom();
      syncSectionImgSrc = syncGoogleClassroom;
    } else if (loginType === SectionLoginType.clever) {
      loginTypeLabel = i18n.loginTypeClever();
      syncSectionImgSrc = syncClever;
    }

    return (
      <div>
        <SignInInstructions loginType={loginType} />
        <br />
        <h2 style={styles.heading}>{i18n.syncingYourStudents()}</h2>
        <div>
          <SafeMarkdown
            markdown={i18n.syncingYourStudentsDescription({
              loginType: loginTypeLabel,
              url: getManageStudentsUrl(sectionId),
            })}
          />
          <br />
          <img
            src={syncSectionImgSrc}
            style={{maxWidth: '50%'}}
            alt={i18n.syncingYourStudents()}
          />
        </div>
      </div>
    );
  }
}

class EmailLogins extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string.isRequired,
    sectionCode: PropTypes.string.isRequired,
    sectionId: PropTypes.number.isRequired,
  };

  render() {
    const {studioUrlPrefix, sectionCode, sectionId} = this.props;

    return (
      <div>
        <h2 style={styles.heading}>{i18n.loginInfo_joinTitle()}</h2>
        <p>{i18n.loginInfo_joinBody()}</p>
        <ol>
          <li>
            {i18n.loginInfo_joinStep1({
              url: `${studioUrlPrefix}/users/sign_up`,
            })}
            <br />
            <img
              src={oauthSignInButtons}
              alt={i18n.loginInfo_joinStep1Buttons()}
            />
          </li>
          <li>{i18n.loginInfo_joinStep2()}</li>
          <li>
            {i18n.loginInfo_joinStep3({
              url: `${studioUrlPrefix}/join`,
              code: sectionCode,
            })}
          </li>
          <li>{i18n.loginInfo_joinStep4()}</li>
        </ol>
        <br />
        <SignInInstructions loginType={SectionLoginType.email} />
        <br />
        <h2 style={styles.heading}>{i18n.loginInfo_resetTitle()}</h2>
        <SafeMarkdown
          markdown={i18n.loginInfo_resetPasswordBody({
            url: getManageStudentsUrl(sectionId),
          })}
        />
      </div>
    );
  }
}

class WordOrPictureLogins extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string.isRequired,
    section: PropTypes.object.isRequired,
    students: PropTypes.array.isRequired,
    autoPrint: PropTypes.bool,
  };

  componentDidMount() {
    if (this.props.autoPrint) {
      this.printLoginCards();
    }
  }

  printLoginCards = () => {
    const {section} = this.props;
    const printArea = document.getElementById('printArea').outerHTML;
    // Popup blockers cause issues with creating a new window for printing.
    // Creating a hidden iframe temporarily on the page as a workaround.
    const printIframe = document.createElement('iframe');
    // The iframe will be embedded in the page but we don't want the user to actually see it.
    printIframe.style.display = 'none';
    // Append the iframe to the document so it's  content is initialized.
    document.body.appendChild(printIframe);
    // Print the content of the iframe after all the content has been loaded.
    printIframe.addEventListener('load', event => {
      // [Hack] Since Safari sends the 'load' event before all the images are loaded, we will delay
      // the print request so the iframe has enough time to load the images.
      setTimeout(() => {
        printIframe.contentWindow.print();
        // Remove the temporary, hidden iframe from the main page.
        printIframe.remove();
      }, 1000);
    });
    // Write the content we want to print to the iframe document.
    printIframe.contentDocument.open();
    printIframe.contentDocument.write(
      `<html><head><title>${i18n.printLoginCards_windowTitle({
        sectionName: section.name,
      })}</title></head>
        <body>${printArea}</body></html>`
    );
    // Flush the written html and trigger content/images to be loaded in the iframe.
    printIframe.contentDocument.close();
  };

  render() {
    const {studioUrlPrefix, section, students} = this.props;
    // Filter out any users who are teachers, used below to generate picture
    // login cards.
    const studentsOnly = students.filter(
      student => student.userType !== 'teacher'
    );
    const manageStudentsUrl = getManageStudentsUrl(section.id);

    return (
      <div>
        <SignInInstructions
          loginType={section.loginType}
          studioUrlPrefix={studioUrlPrefix}
          sectionCode={section.code}
        />
        <p>
          {i18n.loginInfoWordPicMoreBelow({wordOrPicture: section.loginType})}
        </p>
        <br />
        <h2 style={styles.heading}>{i18n.loginInfo_resetTitle()}</h2>
        {section.loginType === SectionLoginType.picture && (
          <SafeMarkdown
            markdown={i18n.loginInfoResetSecretPicDesc({
              url: manageStudentsUrl,
            })}
          />
        )}
        {section.loginType === SectionLoginType.word && (
          <SafeMarkdown
            markdown={i18n.loginInfoResetSecretWordDesc({
              url: manageStudentsUrl,
            })}
          />
        )}
        <br />
        <h2 style={styles.heading}>{i18n.printLoginCards_title()}</h2>
        {students.length < 1 && (
          <SafeMarkdown
            markdown={i18n.loginInfo_noStudents({url: manageStudentsUrl})}
          />
        )}
        {students.length >= 1 && (
          <span>
            <PrintLoginCards
              sectionId={section.id}
              onPrintLoginCards={this.printLoginCards}
              entryPointForMetrics={
                PrintLoginCardsButtonMetricsCategory.LOGIN_INFO
              }
            />
            <br />
            <div id="printArea" style={styles.container}>
              {studentsOnly.map(student => (
                <LoginCard
                  key={student.id}
                  section={section}
                  student={student}
                  studioUrlPrefix={studioUrlPrefix}
                />
              ))}
            </div>
          </span>
        )}
      </div>
    );
  }
}

/**
 * LoginCard component for word and picture logins.
 */
class LoginCard extends React.Component {
  static propTypes = {
    section: PropTypes.object.isRequired,
    student: PropTypes.object.isRequired,
    studioUrlPrefix: PropTypes.string.isRequired,
  };

  render() {
    const {studioUrlPrefix, section, student} = this.props;

    return (
      <div style={styles.card}>
        <SafeMarkdown
          style={styles.text}
          markdown={i18n.loginCardSectionName({
            sectionName: section.name,
          })}
        />
        <SafeMarkdown
          style={styles.text}
          markdown={i18n.loginCardForPrint1({
            directLink: `${studioUrlPrefix}/sections/${section.code}`,
            joinLink: `${studioUrlPrefix}/join`,
            sectionCode: section.code,
          })}
        />
        <SafeMarkdown
          style={styles.text}
          markdown={i18n.loginCardForPrint2({
            studentName: student.name.trim(),
          })}
        />
        {section.loginType === SectionLoginType.word && (
          <SafeMarkdown
            style={styles.text}
            markdown={i18n.loginCardForPrint3Word({
              secretWords: student.secretWords,
            })}
          />
        )}
        {section.loginType === SectionLoginType.picture && (
          <span>
            {i18n.loginCardForPrint3Picture()}
            <br />
            <img
              src={pegasus(`/images/${student.secretPicturePath}`)}
              alt={student.secretPictureName}
              style={styles.img}
            />
            <br />
            <br />
          </span>
        )}
        <div>{i18n.loginCardForPrint4()}</div>
      </div>
    );
  }
}

const styles = {
  container: {
    width: 840,
  },
  card: {
    border: '1px dashed black',
    width: 378,
    padding: 10,
    margin: 8,
    float: 'left',
    fontFamily: '"Gotham 4r", sans-serif',
    color: 'dimgray',
    pageBreakInside: 'avoid',
  },
  text: {
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  img: {
    width: 150,
    marginTop: 10,
  },
  heading: {
    color: color.purple,
    marginTop: 0,
  },
};
