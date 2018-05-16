import React, {Component, PropTypes} from 'react';
import LoginTypeParagraph from '@cdo/apps/templates/teacherDashboard/LoginTypeParagraph';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from "@cdo/locale";

const styles = {
  explination: {
    clear: 'both',
    paddingTop: 20,
  }
};

class ManageStudentsLoginInfo extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    sectionCode: PropTypes.string,
    loginType: PropTypes.string,
  };

  render() {
    const {loginType, sectionId, sectionCode} = this.props;
    return (
      <div style={styles.explination}>
        <h2>Login information</h2>
        {(loginType === SectionLoginType.word || loginType === SectionLoginType.picture) &&
          <div>
            <p>
              {i18n.sectionCode() + ': ' + sectionCode}
            </p>
            <p>
              {i18n.joinSectionExplination()}
              <a target="_blank" href="http://localhost.code.org:3000/join">
                http://localhost.code.org:3000/join
              </a>
            </p>
            <p>
              {i18n.sectionSignInInfo()}
              <a target="_blank" href={`http://localhost-studio.code.org:3000/sections/${sectionCode}`}>
                {`http://localhost-studio.code.org:3000/sections/${sectionCode}`}
              </a>
            </p>
            <p>
              <a target="_blank" href={`/teacher-dashboard#/sections/${sectionId}/print_signin_cards`}>
                {i18n.printLoginCardExplination()}
              </a>
            </p>
          </div>
        }
        {(loginType === SectionLoginType.email) &&
          <div>
            <p>
              {i18n.joinSectionAsk()}
              <a target="_blank" href={`http://localhost-studio.code.org:3000/join/${sectionCode}`}>
                {`http://localhost-studio.code.org:3000/join/${sectionCode}`}
              </a>
            </p>
          </div>
        }
        <h2>Login type</h2>
        <LoginTypeParagraph
          sectionId={sectionId}
          onLoginTypeChanged={() => window.location.reload()}
        />
        <h2>Privacy</h2>
        <p>
          <a target="_blank" href={"/privacy/student-privacy"}>
          {i18n.privacyDocExplination()}
          </a>
        </p>
      </div>
    );
  }
}

export default ManageStudentsLoginInfo;
