import React, {Component, PropTypes} from 'react';
import LoginTypeParagraph from '@cdo/apps/templates/teacherDashboard/LoginTypeParagraph';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from "@cdo/locale";
import {studio, pegasus} from '@cdo/apps/lib/util/urlHelpers';

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
  };

  joinSectionUrl = (loginType) => {
    if (loginType === SectionLoginType.word || loginType === SectionLoginType.picture) {
      return pegasus('/join');
    } else if (loginType === SectionLoginType.email) {
      return studio(`/join/${this.props.sectionCode}`);
    }
  };

  sectionSignInUrl = () => {
    return studio(`/sections/${this.props.sectionCode}`);
  };

  printSignInCardsUrl = () => {
    return pegasus(`/teacher-dashboard#/sections/${this.props.sectionId}/print_signin_cards`);
  };

  studentPrivacyUrl = () => {
    return pegasus('/privacy/student-privacy');
  };

  render() {
    const {loginType, sectionId, sectionCode} = this.props;
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
              <a target="_blank" href={this.joinSectionUrl(loginType)}>
                {this.joinSectionUrl(loginType)}
              </a>
            </p>
            <p>
              {i18n.sectionSignInInfo()}
              <a target="_blank" href={this.sectionSignInUrl()}>
                {this.sectionSignInUrl()}
              </a>
            </p>
            <p>
              <a target="_blank" href={this.printSignInCardsUrl()}>
                {i18n.printLoginCardExplanation()}
              </a>
            </p>
          </div>
        }
        {(loginType === SectionLoginType.email) &&
          <div>
            <p>
              {i18n.joinSectionAsk()}
              <a target="_blank" href={this.joinSectionUrl(loginType)}>
                {this.joinSectionUrl(loginType)}
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
          <a id="uitest-privacy-link" target="_blank" href={this.studentPrivacyUrl()}>
            {i18n.privacyDocExplanation()}
          </a>
        </p>
      </div>
    );
  }
}

export default ManageStudentsLoginInfo;
