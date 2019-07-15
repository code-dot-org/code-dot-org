import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import Button from '@cdo/apps/templates/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import oauthSignInButtons from '../../../static/teacherDashboard/oauthSignInButtons.png';
import googleSignInButton from '../../../static/teacherDashboard/googleSignInButton.png';
import syncGoogleClassroom from '../../../static/teacherDashboard/syncGoogleClassroom.png';
import syncClever from '../../../static/teacherDashboard/syncClever.png';

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
    pegasusUrlPrefix: PropTypes.string.isRequired,

    // Provided by redux.
    section: PropTypes.shape({
      id: PropTypes.number.isRequired,
      loginType: PropTypes.string.isRequired
    }).isRequired,
    students: PropTypes.array.isRequired
  };

  render() {
    const {studioUrlPrefix, pegasusUrlPrefix, section, students} = this.props;

    return (
      <div>
        {[SectionLoginType.word, SectionLoginType.picture].includes(
          section.loginType
        ) && (
          <WordOrPictureLogins
            studioUrlPrefix={studioUrlPrefix}
            pegasusUrlPrefix={pegasusUrlPrefix}
            section={section}
            students={students}
          />
        )}
        {section.loginType === SectionLoginType.email && (
          <EmailLogins
            studioUrlPrefix={studioUrlPrefix}
            pegasusUrlPrefix={pegasusUrlPrefix}
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
        <h1>{i18n.loginInfo_signingIn()}</h1>
        {loginType === SectionLoginType.google_classroom && (
          <p>
            {`${i18n.loginInfo_signingInDescription()} ${i18n.loginInfo_signingInGoogle()}`}
            <br />
            <img src={googleSignInButton} style={{maxWidth: '50%'}} />
          </p>
        )}
        {loginType === SectionLoginType.clever && (
          <p>{i18n.loginInfo_signingInClever()}</p>
        )}
        <br />
        <h1>{i18n.syncingYourStudents()}</h1>
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
    pegasusUrlPrefix: PropTypes.string.isRequired,
    sectionCode: PropTypes.string.isRequired,
    sectionId: PropTypes.number.isRequired
  };

  render() {
    const {
      studioUrlPrefix,
      pegasusUrlPrefix,
      sectionCode,
      sectionId
    } = this.props;

    return (
      <div>
        <h1>{i18n.loginInfo_joinTitle()}</h1>
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
              url: `${pegasusUrlPrefix}/join`,
              code: sectionCode
            })}
          </li>
          <li>{i18n.loginInfo_joinStep4()}</li>
        </ol>
        <br />
        <h1>{i18n.loginInfo_signingIn()}</h1>
        <p>{i18n.loginInfo_signingInDescription()}</p>
        <br />
        <h1>{i18n.loginInfo_resetTitle()}</h1>
        <SafeMarkdown
          markdown={i18n.loginInfo_resetPasswordBody({
            url: getManageStudentsUrl(sectionId)
          })}
        />
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
  }
};

class WordOrPictureLogins extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string.isRequired,
    pegasusUrlPrefix: PropTypes.string.isRequired,
    section: PropTypes.object.isRequired,
    students: PropTypes.array.isRequired
  };

  printLoginCards = () => {
    const printArea = document.getElementById('printArea').outerHTML;
    // Adding a unique ID to the window name allows for multiple instances of this window
    // to be open at once without affecting each other.
    const windowName = `printWindow-${_.uniqueId()}`;
    let printWindow = window.open('', windowName, '');
    const {section} = this.props;

    printWindow.document.write(
      `<html><head><title>${i18n.printLoginCards_windowTitle({
        sectionName: section.name
      })}</title></head>`
    );
    printWindow.document.write('<body onafterprint="self.close()">');
    printWindow.document.write(printArea);
    printWindow.document.write('</body></html>');
  };

  render() {
    const {studioUrlPrefix, pegasusUrlPrefix, section, students} = this.props;
    const manageStudentsUrl = getManageStudentsUrl(section.id);

    return (
      <div>
        <h1>{i18n.loginInfo_signingIn()}</h1>
        <p>{i18n.loginInfo_signinSteps()}</p>
        <ol>
          <li>
            {i18n.loginInfo_signinStep1({joinUrl: `${pegasusUrlPrefix}/join`})}
          </li>
          <li>{i18n.loginInfo_signinStep2({code: section.code})}</li>
          <li>{i18n.loginInfo_signinStep3()}</li>
          {section.loginType === SectionLoginType.picture && (
            <li>{i18n.loginInfo_signinStep4_secretPicture()}</li>
          )}
          {section.loginType === SectionLoginType.word && (
            <li>{i18n.loginInfo_signinStep4_secretWords()}</li>
          )}
          <li>{i18n.loginInfo_signinStep5()}</li>
        </ol>
        <p>
          {i18n.loginInfo_signinStepsReset({wordOrPicture: section.loginType})}
        </p>
        <br />
        <h1>{i18n.loginInfo_resetTitle()}</h1>
        <SafeMarkdown
          markdown={i18n.loginInfo_resetSecretBody({
            url: manageStudentsUrl
          })}
        />
        <br />
        <h1>{i18n.printLoginCards_title()}</h1>
        {students.length < 1 && (
          <SafeMarkdown
            markdown={i18n.loginInfo_noStudents({url: manageStudentsUrl})}
          />
        )}
        {students.length >= 1 && (
          <span>
            <Button
              text={i18n.printLoginCards_button()}
              color="orange"
              onClick={this.printLoginCards}
            />
            <br />
            <div id="printArea" style={styles.container}>
              {students.map(student => (
                <LoginCard
                  key={student.id}
                  studioUrlPrefix={studioUrlPrefix}
                  pegasusUrlPrefix={pegasusUrlPrefix}
                  section={section}
                  student={student}
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
    studioUrlPrefix: PropTypes.string.isRequired,
    pegasusUrlPrefix: PropTypes.string.isRequired,
    section: PropTypes.object.isRequired,
    student: PropTypes.object.isRequired
  };

  render() {
    const {studioUrlPrefix, pegasusUrlPrefix, section, student} = this.props;

    return (
      <div style={styles.card}>
        <p style={styles.text}>
          {i18n.loginCard_instructions({
            url: `${pegasusUrlPrefix}/join`,
            code: section.code
          })}
        </p>
        <p style={styles.text}>
          <span style={styles.bold}>{i18n.loginCard_directUrl()}</span>
          {` ${studioUrlPrefix}/sections/${section.code}`}
        </p>
        <p style={styles.text}>
          <span style={styles.bold}>{i18n.loginCard_sectionName()}</span>
          {` ${section.name}`}
        </p>
        <p style={styles.text}>
          <span style={styles.bold}>{i18n.loginCard_name()}</span>
          {` ${student.name}`}
        </p>
        {section.loginType === SectionLoginType.picture && (
          <p style={styles.text}>
            <span style={styles.bold}>{i18n.loginCard_secretPicture()}</span>
            <br />
            <img
              src={`${pegasusUrlPrefix}/images/${student.secret_picture_path}`}
              style={styles.img}
            />
          </p>
        )}
        {section.loginType === SectionLoginType.word && (
          <p style={styles.text}>
            <span style={styles.bold}>{i18n.loginCard_secretWords()}</span>
            <span>{` ${student.secret_words}`}</span>
          </p>
        )}
      </div>
    );
  }
}
