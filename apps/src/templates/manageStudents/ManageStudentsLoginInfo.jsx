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
        <h2>Login type</h2>
        <LoginTypeParagraph
          sectionId={sectionId}
          onLoginTypeChanged={() => window.location.reload()}
        />
        <h2>Login information</h2>
        {(loginType === SectionLoginType.word || loginType === SectionLoginType.picture) &&
          <div>
            {sectionCode}
            <p>
              {"Ask your students to go to http://localhost.code.org:3000/join and type in the section code (${sectionCode})"}
            </p>
            <p>
              Alternatively, share this section's sign in page with your students: http://localhost-studio.code.org:3000/sections/YNGDSR
            </p>
            <p>
              <a target="_blank" href={"/teacher-dashboard#/sections/${sectionId}/print_signin_cards"}>
                {i18n.printLoginCardExplination()}
              </a>
            </p>
          </div>
        }
        {(loginType === SectionLoginType.email) &&
          <div>
          </div>
        }
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
