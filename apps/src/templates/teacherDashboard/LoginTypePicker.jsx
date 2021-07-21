/**
 * View shown to a teacher when beginning to add students to an empty section.
 * Lets the teacher decide whether to use word/picture logins, have students
 * manage their own accounts via email/oauth, or to sync students with an
 * external service like Microsoft Classroom or Clever.
 */
import PropTypes from 'prop-types';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {Heading1, Heading2} from '../../lib/ui/Headings';
import CardContainer from './CardContainer';
import LoginTypeCard from './LoginTypeCard';
import Button from '../Button';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import styleConstants from '../../styleConstants';

const style = {
  root: {
    width: styleConstants['content-width'],
    height: '80vh',
    left: 20,
    right: 20
  },
  scroll: {
    overflowX: 'hidden',
    overflowY: 'auto',
    height: 'calc(80vh - 200px)'
  },
  thirdPartyProviderUpsell: {
    marginBottom: '10px'
  },
  footer: {
    position: 'absolute',
    width: styleConstants['content-width'],
    height: '100px',
    left: 0,
    bottom: '-65px',
    padding: '0px 20px 20px 20px',
    backgroundColor: '#fff',
    borderRadius: '5px'
  },
  emailPolicyNote: {
    marginBottom: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #000'
  }
};

/**
 * UI for selecting the login type of a class section:
 * Word, picture, or email logins, or one of several third-party integrations.
 */
class LoginTypePicker extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    handleImportOpen: PropTypes.func,
    setRosterProvider: PropTypes.func,
    setLoginType: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    // Provided by Redux
    providers: PropTypes.arrayOf(PropTypes.string)
  };

  openImportDialog = provider => {
    this.props.setRosterProvider(provider);
    this.props.handleCancel(); // close this dialog
    this.props.handleImportOpen(); // open the roster dialog
  };

  render() {
    const {providers, setLoginType, handleCancel, disabled} = this.props;
    const withGoogle =
      providers && providers.includes(OAuthSectionTypes.google_classroom);
    const withMicrosoft =
      providers && providers.includes(OAuthSectionTypes.microsoft_classroom);
    const withClever =
      providers && providers.includes(OAuthSectionTypes.clever);
    const hasThirdParty = withGoogle | withMicrosoft | withClever;

    return (
      <div style={style.root}>
        <Heading1>{i18n.newSectionUpdated()}</Heading1>
        <Heading2>{i18n.addStudentsToSectionInstructionsUpdated()}</Heading2>
        <div style={style.scroll}>
          <CardContainer>
            {withGoogle && (
              <GoogleClassroomCard onClick={this.openImportDialog} />
            )}
            {withMicrosoft && (
              <MicrosoftClassroomCard onClick={this.openImportDialog} />
            )}
            {withClever && <CleverCard onClick={this.openImportDialog} />}
            <PictureLoginCard onClick={setLoginType} />
            <WordLoginCard onClick={setLoginType} />
            <EmailLoginCard onClick={setLoginType} />
          </CardContainer>
        </div>
        {!hasThirdParty && (
          <div>
            {i18n.thirdPartyProviderUpsell() + ' '}
            <a href="https://support.code.org/hc/en-us/articles/115001319312-Setting-up-sections-with-Google-Classroom-or-Clever">
              {i18n.learnHow()}
            </a>
            {' ' + i18n.connectAccountThirdPartyProviders()}
          </div>
        )}
        <div style={style.footer}>
          <div style={style.emailPolicyNote}>
            <b>{i18n.note()}</b>
            {' ' + i18n.emailAddressPolicy() + ' '}
            <a href="http://blog.code.org/post/147756946588/codeorgs-new-login-approach-to-student-privacy">
              {i18n.moreInfo()}
            </a>
          </div>
          <Button
            __useDeprecatedTag
            onClick={handleCancel}
            text={i18n.dialogCancel()}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
}
export const UnconnectedLoginTypePicker = LoginTypePicker;
export default connect(state => ({
  providers: state.teacherSections.providers
}))(LoginTypePicker);

const PictureLoginCard = props => (
  <LoginTypeCard
    className="uitest-pictureLogin"
    title={i18n.loginTypePictureUpdated()}
    subtitle={i18n.loginTypePictureAgeGroup()}
    description={i18n.loginTypePictureDescription()}
    onClick={() => props.onClick('picture')}
  />
);
PictureLoginCard.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

const WordLoginCard = props => (
  <LoginTypeCard
    className="uitest-wordLogin"
    title={i18n.loginTypeWordUpdated()}
    subtitle={i18n.loginTypeWordAgeGroup()}
    description={i18n.loginTypeWordDescription()}
    onClick={() => props.onClick('word')}
  />
);
WordLoginCard.propTypes = PictureLoginCard.propTypes;

const EmailLoginCard = props => (
  <LoginTypeCard
    className="uitest-emailLogin"
    title={i18n.loginTypePersonal()}
    subtitle={i18n.loginTypeEmailAgeGroup()}
    description={i18n.loginTypeEmailDescription()}
    onClick={() => props.onClick('email')}
  />
);
EmailLoginCard.propTypes = PictureLoginCard.propTypes;

const GoogleClassroomCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeGoogleClassroom()}
    description={i18n.loginTypeGoogleClassroomDescriptionUpdated()}
    onClick={() => props.onClick(OAuthSectionTypes.google_classroom)}
  />
);
GoogleClassroomCard.propTypes = PictureLoginCard.propTypes;

const MicrosoftClassroomCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeMicrosoftClassroom()}
    description={i18n.loginTypeMicrosoftClassroomDescriptionUpdated()}
    onClick={() => props.onClick(OAuthSectionTypes.microsoft_classroom)}
  />
);
MicrosoftClassroomCard.propTypes = PictureLoginCard.propTypes;

const CleverCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeClever()}
    description={i18n.loginTypeCleverDescriptionUpdated()}
    onClick={() => props.onClick(OAuthSectionTypes.clever)}
  />
);
CleverCard.propTypes = PictureLoginCard.propTypes;
