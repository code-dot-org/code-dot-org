/**
 * View shown to a teacher when beginning to add students to an empty section.
 * Lets the teacher decide whether to use word/picture logins, have students
 * manage their own accounts via email/oauth, or to sync students with an
 * external service like Microsoft Classroom or Clever.
 */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {Heading1, Heading2, Heading3} from '../../lib/ui/Headings';
import CardContainer from './CardContainer';
import DialogFooter from './DialogFooter';
import LoginTypeCard from './LoginTypeCard';
import Button from "../Button";
import {OAuthSectionTypes} from "./shapes";

/**
 * UI for selecting the login type of a class section:
 * Word, picture, or email logins, or one of several third-party integrations.
 */
class LoginTypePicker extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    handleImportOpen: PropTypes.func,
    setLoginType: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    // Provided by Redux
    provider: PropTypes.string,
  };

  openImportDialog = () => {
    this.props.handleCancel(); // close this dialog
    this.props.handleImportOpen(); // open the roster dialog
  };

  render() {
    const {
      title,
      provider,
      setLoginType,
      handleImportOpen,
      handleCancel,
      disabled,
    } = this.props;
    const withGoogle = provider === OAuthSectionTypes.google_classroom;
    const withMicrosoft = provider === OAuthSectionTypes.microsoft_classroom;
    const withClever = provider === OAuthSectionTypes.clever;
    const anyImportOptions = (withGoogle || withMicrosoft || withClever) &&
      (typeof handleImportOpen === 'function');

    return (
      <div>
        <Heading1>
          {title}
        </Heading1>
        <Heading2>
          {i18n.addStudentsToSectionInstructions()}
        </Heading2>
        {anyImportOptions && (
          <Heading3>
            {i18n.addStudentsManageMyOwn()}
          </Heading3>
        )}
        <CardContainer>
          <PictureLoginCard
            onClick={setLoginType}
            disabled={disabled}
          />
          <WordLoginCard
            onClick={setLoginType}
            disabled={disabled}
          />
          <EmailLoginCard
            onClick={setLoginType}
            disabled={disabled}
          />
        </CardContainer>
        <div>
          <b>{i18n.note()}</b>{" " + i18n.emailAddressPolicy() + " "}
          <a href="http://blog.code.org/post/147756946588/codeorgs-new-login-approach-to-student-privacy">{i18n.moreInfo()}</a>
        </div>
        {anyImportOptions && (
          <div>
            <Heading3>
              {i18n.addStudentsSyncThirdParty()}
            </Heading3>
            <CardContainer>
              {withGoogle &&
                <GoogleClassroomCard
                  onClick={this.openImportDialog}
                  disabled={disabled}
                />
              }
              {withMicrosoft &&
                <MicrosoftClassroomCard
                  onClick={this.openImportDialog}
                  disabled={disabled}
                />
              }
              {withClever &&
                <CleverCard
                  onClick={this.openImportDialog}
                  disabled={disabled}
                />
              }
            </CardContainer>
          </div>
        )}
        <DialogFooter>
          <Button
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
  provider: state.teacherSections.provider,
}))(LoginTypePicker);

const PictureLoginCard = (props) => (
  <LoginTypeCard
    className="uitest-pictureLogin"
    title={i18n.loginTypePicture()}
    subtitle={i18n.loginTypePictureAgeGroup()}
    description={i18n.loginTypePictureDescription()}
    buttonText={i18n.loginTypePictureButton()}
    onClick={() => props.onClick('picture')}
    disabled={props.disabled}
  />
);
PictureLoginCard.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const WordLoginCard = (props) => (
  <LoginTypeCard
    className="uitest-wordLogin"
    title={i18n.loginTypeWord()}
    subtitle={i18n.loginTypeWordAgeGroup()}
    description={i18n.loginTypeWordDescription()}
    buttonText={i18n.loginTypeWordButton()}
    onClick={() => props.onClick('word')}
    disabled={props.disabled}
  />
);
WordLoginCard.propTypes = PictureLoginCard.propTypes;

const EmailLoginCard = (props) => (
  <LoginTypeCard
    className="uitest-emailLogin"
    title={i18n.loginTypePersonal()}
    subtitle={i18n.loginTypeEmailAgeGroup()}
    description={i18n.loginTypeEmailDescription()}
    buttonText={i18n.loginTypeEmailButton()}
    onClick={() => props.onClick('email')}
    disabled={props.disabled}
  />
);
EmailLoginCard.propTypes = PictureLoginCard.propTypes;

const GoogleClassroomCard = (props) => (
  <LoginTypeCard
    title={i18n.loginTypeGoogleClassroom()}
    description={i18n.loginTypeGoogleClassroomDescription()}
    buttonText={i18n.loginTypeGoogleClassroomButton()}
    onClick={() => props.onClick('google')}
    disabled={props.disabled}
  />
);
GoogleClassroomCard.propTypes = PictureLoginCard.propTypes;

const MicrosoftClassroomCard = (props) => (
  <LoginTypeCard
    title={i18n.loginTypeMicrosoftClassroom()}
    description={i18n.loginTypeMicrosoftClassroomDescription()}
    buttonText={i18n.loginTypeMicrosoftClassroomButton()}
    onClick={() => props.onClick('microsoft')}
    disabled={props.disabled}
  />
);
MicrosoftClassroomCard.propTypes = PictureLoginCard.propTypes;

const CleverCard = (props) => (
  <LoginTypeCard
    title={i18n.loginTypeClever()}
    description={i18n.loginTypeCleverDescription()}
    buttonText={i18n.loginTypeCleverButton()}
    onClick={() => props.onClick('clever')}
    disabled={props.disabled}
  />
);
CleverCard.propTypes = PictureLoginCard.propTypes;
