/**
 * View shown to a teacher when beginning to add students to an empty section.
 * Lets the teacher decide whether to use word/picture logins, have students
 * manage their own accounts via email/oauth, or to sync students with an
 * external service like Microsoft Classroom or Clever.
 */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import experiments from '../../util/experiments';
import {Heading1, Heading2, Heading3} from '../../lib/ui/Headings';
import CardContainer from './CardContainer';
import DialogFooter from './DialogFooter';
import LoginTypeCard from './LoginTypeCard';
import Button from "../Button";
import {
  cancelEditingSection,
  editSectionProperties,
} from './teacherSectionsRedux';
import {OAuthSectionTypes} from "./shapes";

/**
 * UI for selecting the login type of a class section:
 * Word, picture, or email logins, or one of several third-party integrations.
 */
class LoginTypePicker extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    handleImportOpen: PropTypes.func.isRequired,
    // Provided by Redux
    provider: PropTypes.string,
    setLoginType: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
  };

  openImportDialog = () => {
    this.props.handleCancel(); // close this dialog
    this.props.handleImportOpen(); // open the roster dialog
  };

  render() {
    const {title, provider, setLoginType, handleCancel} = this.props;
    const withGoogle = provider === OAuthSectionTypes.google_classroom;
    const withMicrosoft = provider === OAuthSectionTypes.microsoft_classroom;
    const withClever = provider === OAuthSectionTypes.clever;
    const anyImportOptions = experiments.isEnabled('importClassroom') &&
      (withGoogle || withMicrosoft || withClever);

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
          <PictureLoginCard onClick={setLoginType}/>
          <WordLoginCard onClick={setLoginType}/>
          <EmailLoginCard onClick={setLoginType}/>
        </CardContainer>
        {anyImportOptions && (
          <div>
            <Heading3>
              {i18n.addStudentsSyncThirdParty()}
            </Heading3>
            <CardContainer>
              {withGoogle &&
                <GoogleClassroomCard onClick={this.openImportDialog}/>}
              {withMicrosoft &&
                <MicrosoftClassroomCard onClick={this.openImportDialog}/>}
              {withClever &&
                <CleverCard onClick={this.openImportDialog}/>}
            </CardContainer>
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={handleCancel}
            text="Cancel"
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      </div>
    );
  }
}
export const UnconnectedLoginTypePicker = LoginTypePicker;
export default connect(state => ({
  provider: state.teacherSections.provider,
}), dispatch => ({
  setLoginType: loginType => dispatch(editSectionProperties({loginType})),
  handleCancel: () => dispatch(cancelEditingSection()),
}))(LoginTypePicker);

const PictureLoginCard = (props) => (
  <LoginTypeCard
    className="uitest-pictureLogin"
    title={i18n.loginTypePicture()}
    subtitle={i18n.loginTypePictureAgeGroup()}
    description={i18n.loginTypePictureDescription()}
    buttonText={i18n.loginTypePictureButton()}
    isRtl={false}
    onClick={() => props.onClick('picture')}
  />
);
PictureLoginCard.propTypes = {
  onClick: PropTypes.func.isRequired
};

const WordLoginCard = (props) => (
  <LoginTypeCard
    title={i18n.loginTypeWord()}
    subtitle={i18n.loginTypeWordAgeGroup()}
    description={i18n.loginTypeWordDescription()}
    buttonText={i18n.loginTypeWordButton()}
    isRtl={false}
    onClick={() => props.onClick('word')}
  />
);
WordLoginCard.propTypes = PictureLoginCard.propTypes;

const EmailLoginCard = (props) => (
  <LoginTypeCard
    title={i18n.loginTypeEmail()}
    subtitle={i18n.loginTypeEmailAgeGroup()}
    description={i18n.loginTypeEmailDescription()}
    buttonText={i18n.loginTypeEmailButton()}
    isRtl={false}
    onClick={() => props.onClick('email')}
  />
);
EmailLoginCard.propTypes = PictureLoginCard.propTypes;

const GoogleClassroomCard = (props) => (
  <LoginTypeCard
    title={i18n.loginTypeGoogleClassroom()}
    description={i18n.loginTypeGoogleClassroomDescription()}
    buttonText={i18n.loginTypeGoogleClassroomButton()}
    isRtl={false}
    onClick={() => props.onClick('google')}
  />
);
GoogleClassroomCard.propTypes = PictureLoginCard.propTypes;

const MicrosoftClassroomCard = (props) => (
  <LoginTypeCard
    title={i18n.loginTypeMicrosoftClassroom()}
    description={i18n.loginTypeMicrosoftClassroomDescription()}
    buttonText={i18n.loginTypeMicrosoftClassroomButton()}
    isRtl={false}
    onClick={() => props.onClick('microsoft')}
  />
);
MicrosoftClassroomCard.propTypes = PictureLoginCard.propTypes;

const CleverCard = (props) => (
  <LoginTypeCard
    title={i18n.loginTypeClever()}
    description={i18n.loginTypeCleverDescription()}
    buttonText={i18n.loginTypeCleverButton()}
    isRtl={false}
    onClick={() => props.onClick('clever')}
  />
);
CleverCard.propTypes = PictureLoginCard.propTypes;
