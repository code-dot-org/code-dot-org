/**
 * View shown to a teacher when beginning to add students to an empty section.
 * Lets the teacher decide whether to use word/picture logins, have students
 * manage their own accounts via email/oauth, or to sync students with an
 * external service like Microsoft Classroom or Clever.
 */
import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import experiments from '../../util/experiments';
import {Heading1, Heading2, Heading3} from '../../lib/ui/Headings';
import CardContainer from './CardContainer';
import DialogFooter from './DialogFooter';
import LoginTypeCard from './LoginTypeCard';
import Button from "../Button";

class LoginTypePicker extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    handleLoginChoice: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
  };

  render() {
    const {title, handleLoginChoice, handleCancel} = this.props;
    const googleClassroom = experiments.isEnabled('googleClassroom');
    const microsoftClassroom = experiments.isEnabled('microsoftClassroom');
    const clever = experiments.isEnabled('clever');
    const anyThirdParty = googleClassroom || microsoftClassroom || clever;

    return (
      <div>
        <Heading1>
          {title}
        </Heading1>
        <Heading2>
          {i18n.addStudentsToSectionInstructions()}
        </Heading2>
        {anyThirdParty && (
          <Heading3>
            {i18n.addStudentsManageMyOwn()}
          </Heading3>
        )}
        <CardContainer>
          <PictureLoginCard
            onClick={handleLoginChoice}
          />
          <WordLoginCard
            onClick={handleLoginChoice}
          />
          <EmailLoginCard
            onClick={handleLoginChoice}
          />
        </CardContainer>
        {anyThirdParty && (
          <div>
            <Heading3>
              {i18n.addStudentsSyncThirdParty()}
            </Heading3>
            <CardContainer>
              {googleClassroom &&
              <GoogleClassroomCard
                onClick={handleLoginChoice}
              />}
              {microsoftClassroom &&
              <MicrosoftClassroomCard
                onClick={handleLoginChoice}
              />}
              {clever &&
              <CleverCard
                onClick={handleLoginChoice}
              />}
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
export default LoginTypePicker;

const PictureLoginCard = (props) => (
  <LoginTypeCard
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
