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
import DialogFooter from './DialogFooter';
import LoginTypeCard from './LoginTypeCard';
import Button from '../Button';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import styleConstants from '../../styleConstants';

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
    const {title, providers, setLoginType, handleCancel, disabled} = this.props;
    const withGoogle =
      providers && providers.includes(OAuthSectionTypes.google_classroom);
    const withMicrosoft =
      providers && providers.includes(OAuthSectionTypes.microsoft_classroom);
    const withClever =
      providers && providers.includes(OAuthSectionTypes.clever);
    const hasThirdParty = withGoogle | withMicrosoft | withClever;

    // explicitly constrain the container as a whole to the width of the
    // content. We expect that differing length of translations versus english
    // source text can cause unexpected layout changes, and this constraint
    // should help mitigate some of them.
    const containerStyle = {maxWidth: styleConstants['content-width']};

    // anchor email address policy note to footer just above 'Cancel' button
    const emailPolicyNoteStyle = {
      position: 'absolute',
      top: '0px',
      zIndex: '600'
    };

    return (
      <div style={containerStyle}>
        <Heading1>{title}</Heading1>
        <Heading2>{i18n.addStudentsToSectionInstructionsUpdated()}</Heading2>
        <div>
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
        <DialogFooter>
          <div style={emailPolicyNoteStyle}>
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
        </DialogFooter>
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
