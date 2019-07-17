import PropTypes from 'prop-types';
import React, {Component} from 'react';
import LoginTypeParagraph from '@cdo/apps/templates/teacherDashboard/LoginTypeParagraph';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';
import googleSignInButton from '../../../static/teacherDashboard/googleSignInButton.png';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import Button from '../../templates/Button';

const styles = {
  explanation: {
    clear: 'both',
    paddingTop: 20
  }
};

class ManageStudentsLoginInfo extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    sectionCode: PropTypes.string,
    loginType: PropTypes.string,
    // The prefix for the code studio url in the current environment,
    // e.g. 'https://studio.code.org' or 'http://localhost-studio.code.org:3000'.
    studioUrlPrefix: PropTypes.string,
    pegasusUrlPrefix: PropTypes.string
  };

  render() {
    const {
      loginType,
      sectionId,
      sectionCode,
      studioUrlPrefix,
      pegasusUrlPrefix
    } = this.props;

    return (
      <div style={styles.explanation}>
        <h2>{i18n.loginInformation()}</h2>
        {(loginType === SectionLoginType.word ||
          loginType === SectionLoginType.picture) && (
          <div>
            <p>{i18n.sectionCode() + ': ' + sectionCode}</p>
            <p>
              {i18n.joinSectionExplanation()}
              <a target="_blank" href={`${studioUrlPrefix}/join`}>
                {`${studioUrlPrefix}/join`}
              </a>
            </p>
            <p>
              {i18n.sectionSignInInfo()}
              <a
                target="_blank"
                href={`${studioUrlPrefix}/sections/${sectionCode}`}
              >
                {`${studioUrlPrefix}/sections/${sectionCode}`}
              </a>
            </p>
            <p>
              <a
                target="_blank"
                href={teacherDashboardUrl(sectionId, '/login_info')}
              >
                {i18n.printLoginCardExplanation()}
              </a>
            </p>
          </div>
        )}
        {loginType === SectionLoginType.email && (
          <div>
            <p>
              {i18n.joinSectionAsk()}
              <a
                target="_blank"
                href={`${studioUrlPrefix}/join/${sectionCode}`}
              >
                {`${studioUrlPrefix}/join/${sectionCode}`}
              </a>
            </p>
          </div>
        )}
        {loginType === SectionLoginType.google_classroom && (
          <p>
            {`${i18n.loginInfo_signingInDescription()} ${i18n.loginInfo_signingInGoogle()}`}
            <br />
            <img src={googleSignInButton} style={{maxWidth: '35%'}} />
            <br />
            {i18n.loginInfo_oauthSectionCodes({
              provider: i18n.loginTypeGoogleClassroom()
            })}
          </p>
        )}
        {loginType === SectionLoginType.clever && (
          <p>
            {i18n.loginInfo_signingInClever()}{' '}
            {i18n.loginInfo_oauthSectionCodes({
              provider: i18n.loginTypeClever()
            })}
          </p>
        )}
        <h2>{i18n.loginType()}</h2>
        <LoginTypeParagraph
          sectionId={sectionId}
          onLoginTypeChanged={() => window.location.reload()}
        />
        <h2>{i18n.privacyHeading()}</h2>
        <p>{i18n.privacyDocExplanation()}</p>
        <Button
          color="white"
          id="uitest-privacy-link"
          target="_blank"
          href={`${pegasusUrlPrefix}/privacy/student-privacy`}
          text={i18n.privacyButton()}
        />
      </div>
    );
  }
}

export default ManageStudentsLoginInfo;
