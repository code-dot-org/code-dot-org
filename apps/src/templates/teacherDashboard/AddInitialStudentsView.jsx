import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import experiments from '../../util/experiments';
import {Heading1, Heading2, Heading3} from '../../lib/ui/Headings';
import CardContainer from './CardContainer';
import LoginTypeCard from './LoginTypeCard';

/**
 * View shown to a teacher when beginning to add students to an empty section.
 * Lets the teacher decide whether to use word/picture logins, have students
 * manage their own accounts via email/oauth, or to sync students with an
 * external service like Microsoft Classroom or Clever.
 */
class AddInitialStudentsView extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
  };

  render() {
    const {sectionName} = this.props;
    const googleClassroom = experiments.isEnabled('googleClassroom');
    const microsoftClassroom = experiments.isEnabled('microsoftClassroom');
    const clever = experiments.isEnabled('clever');
    const anyThirdParty = googleClassroom || microsoftClassroom || clever;

    return (
      <div>
        <Heading1>
          {i18n.addStudentsToSection({section: sectionName})}
        </Heading1>
        <Heading2>
          {i18n.addStudentsToSectionInstructions()}
        </Heading2>
        <Heading3>
          {i18n.addStudentsManageMyOwn()}
        </Heading3>
        <CardContainer>
          <PictureLoginCard/>
          <WordLoginCard/>
          <EmailLoginCard/>
        </CardContainer>
        {anyThirdParty && (
          <div>
            <Heading3>
              {i18n.addStudentsSyncThirdParty()}
            </Heading3>
            <CardContainer>
              {googleClassroom && <GoogleClassroomCard/>}
              {microsoftClassroom && <MicrosoftClassroomCard/>}
              {clever && <CleverCard/>}
            </CardContainer>
          </div>
        )}
      </div>
    );
  }
}
export default AddInitialStudentsView;

const PictureLoginCard = () => (
  <LoginTypeCard
    title={i18n.loginTypePicture()}
    subtitle={i18n.loginTypePictureAgeGroup()}
    description={i18n.loginTypePictureDescription()}
    buttonText={i18n.loginTypePictureButton()}
    link="#"
    isRtl={false}
  />
);

const WordLoginCard = () => (
  <LoginTypeCard
    title={i18n.loginTypeWord()}
    subtitle={i18n.loginTypeWordAgeGroup()}
    description={i18n.loginTypeWordDescription()}
    buttonText={i18n.loginTypeWordButton()}
    link="#"
    isRtl={false}
  />
);

const EmailLoginCard = () => (
  <LoginTypeCard
    title={i18n.loginTypeEmail()}
    subtitle={i18n.loginTypeEmailAgeGroup()}
    description={i18n.loginTypeEmailDescription()}
    buttonText={i18n.loginTypeEmailButton()}
    link="#"
    isRtl={false}
  />
);

const GoogleClassroomCard = () => (
  <LoginTypeCard
    title={i18n.loginTypeGoogleClassroom()}
    description={i18n.loginTypeGoogleClassroomDescription()}
    buttonText={i18n.loginTypeGoogleClassroomButton()}
    link="#"
    isRtl={false}
  />
);

const MicrosoftClassroomCard = () => (
  <LoginTypeCard
    title={i18n.loginTypeMicrosoftClassroom()}
    description={i18n.loginTypeMicrosoftClassroomDescription()}
    buttonText={i18n.loginTypeMicrosoftClassroomButton()}
    link="#"
    isRtl={false}
  />
);

const CleverCard = () => (
  <LoginTypeCard
    title={i18n.loginTypeClever()}
    description={i18n.loginTypeCleverDescription()}
    buttonText={i18n.loginTypeCleverButton()}
    link="#"
    isRtl={false}
  />
);
