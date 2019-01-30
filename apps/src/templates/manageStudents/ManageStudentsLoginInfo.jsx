import React, {Component, PropTypes} from 'react';
import LoginTypeParagraph from '@cdo/apps/templates/teacherDashboard/LoginTypeParagraph';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from "@cdo/locale";

const styles = {
  explanation: {
    clear: 'both',
    paddingTop: 20,
  }
};

class ManageStudentsLoginInfo extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    sectionCode: PropTypes.string,
    loginType: PropTypes.string,
    // The prefix for the code studio url in the current environment,
    // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
    studioUrlPrefix: PropTypes.string,
  };

  render() {
    const {loginType, sectionId, sectionCode, studioUrlPrefix} = this.props;
    return (
      <div style={styles.explanation}>
        <h2>Login information</h2>
        {(loginType === SectionLoginType.word || loginType === SectionLoginType.picture) &&
          <div>
            <p>
              {i18n.sectionCode() + ': ' + sectionCode}
            </p>
            <p>
              {i18n.joinSectionExplanation()}
              <a target="_blank" href={`${window.location.origin}/join`}>
                {`${window.location.origin}/join`}
              </a>
            </p>
            <p>
              {i18n.sectionSignInInfo()}
              <a target="_blank" href={`http:${studioUrlPrefix}/sections/${sectionCode}`}>
                {`http:${studioUrlPrefix}/sections/${sectionCode}`}
              </a>
            </p>
            <p>
              <a target="_blank" href={`/teacher-dashboard#/sections/${sectionId}/print_signin_cards`}>
                {i18n.printLoginCardExplanation()}
              </a>
            </p>
          </div>
        }
        {(loginType === SectionLoginType.email) &&
          <div>
            <p>
              {i18n.joinSectionAsk()}
              <a target="_blank" href={`http:${studioUrlPrefix}/join/${sectionCode}`}>
                {`http:${studioUrlPrefix}/join/${sectionCode}`}
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
          <a id="uitest-privacy-link" target="_blank" href={"/privacy/student-privacy"}>
          {i18n.privacyDocExplanation()}
          </a>
        </p>
      </div>
    );
  }
}

export default ManageStudentsLoginInfo;
