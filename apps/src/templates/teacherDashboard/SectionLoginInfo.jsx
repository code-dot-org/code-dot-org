import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
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
      loginType: PropTypes.string.isRequired
    }).isRequired,
    students: PropTypes.array.isRequired
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
  students: state.sectionData.section.students
}))(SectionLoginInfo);

class OAuthLogins extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    loginType: PropTypes.oneOf([
      SectionLoginType.google_classroom,
      SectionLoginType.clever
    ]).isRequired
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
              url: getManageStudentsUrl(sectionId)
            })}
          />
          <br />
          <img src={syncSectionImgSrc} style={{maxWidth: '50%'}} />
        </div>
      </div>
    );
  }
}

class EmailLogins extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string.isRequired,
    sectionCode: PropTypes.string.isRequired,
    sectionId: PropTypes.number.isRequired
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
              url: `${studioUrlPrefix}/users/sign_up`
            })}
            <br />
            <img src={oauthSignInButtons} />
          </li>
          <li>{i18n.loginInfo_joinStep2()}</li>
          <li>
            {i18n.loginInfo_joinStep3({
              url: `${studioUrlPrefix}/join`,
              code: sectionCode
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
            url: getManageStudentsUrl(sectionId)
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
    autoPrint: PropTypes.bool
  };

  componentDidMount() {
    if (this.props.autoPrint) {
      this.printLoginCards();
    }
  }

  printLoginCards = () => {
    const printArea = document.getElementById('printArea').outerHTML;
    // Adding a unique ID to the window name allows for multiple instances of this window
    // to be open at once without affecting each other.
    const windowName = `printWindow-${_.uniqueId()}`;
    let printWindow = window.open('', windowName, '');
    const {section} = this.props;

    printWindow.document.open();
    printWindow.addEventListener('load', event => {
      printWindow.print();
    });

    printWindow.document.write(
      `<html><head><title>${i18n.printLoginCards_windowTitle({
        sectionName: section.name
      })}</title></head>`
    );
    printWindow.document.write('<body onafterprint="self.close()">');
    printWindow.document.write(printArea);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  render() {
    const {studioUrlPrefix, section, students} = this.props;
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
              url: manageStudentsUrl
            })}
          />
        )}
        {section.loginType === SectionLoginType.word && (
          <SafeMarkdown
            markdown={i18n.loginInfoResetSecretWordDesc({
              url: manageStudentsUrl
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
              {students.map(student => (
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
    studioUrlPrefix: PropTypes.string.isRequired
  };

  render() {
    const {studioUrlPrefix, section, student} = this.props;

    return (
      <div style={styles.card}>
        <SafeMarkdown
          style={styles.text}
          markdown={i18n.loginCardSectionName({
            sectionName: section.name
          })}
        />
        <SafeMarkdown
          style={styles.text}
          markdown={i18n.loginCardForPrint1({
            directLink: `${studioUrlPrefix}/sections/${section.code}`,
            joinLink: `${studioUrlPrefix}/join`,
            sectionCode: section.code
          })}
        />
        <SafeMarkdown
          style={styles.text}
          markdown={i18n.loginCardForPrint2({
            studentName: student.name
          })}
        />
        {section.loginType === SectionLoginType.word && (
          <SafeMarkdown
            style={styles.text}
            markdown={i18n.loginCardForPrint3Word({
              secretWords: student.secret_words
            })}
          />
        )}
        {section.loginType === SectionLoginType.picture && (
          <span>
            {i18n.loginCardForPrint3Picture()}
            <br />
            <img
              src={pegasus(`/images/${student.secret_picture_path}`)}
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
    width: 840
  },
  card: {
    border: '1px dashed black',
    width: 378,
    padding: 10,
    margin: 8,
    float: 'left',
    fontFamily: '"Gotham 4r", sans-serif',
    color: 'dimgray',
    pageBreakInside: 'avoid'
  },
  text: {
    fontSize: 14
  },
  bold: {
    fontWeight: 'bold'
  },
  img: {
    width: 150,
    marginTop: 10
  },
  heading: {
    color: color.purple,
    marginTop: 0
  }
};
