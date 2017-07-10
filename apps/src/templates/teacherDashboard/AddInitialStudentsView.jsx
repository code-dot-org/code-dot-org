import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '../../util/color';
import experiments from '../../util/experiments';
import CardContainer from './CardContainer';
import LoginTypeCard from './LoginTypeCard';

const style = {
  h1: {
    fontFamily: '"Gotham 7r", sans-serif',
    fontWeight: 'normal',
    fontSize: 32,
    lineHeight: 1.5,
    color: color.dark_charcoal,
  },
  h2: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'normal',
    fontSize: 24,
    lineHeight: 2,
    color: color.dark_charcoal,
    margin: '10px 0',
  },
  h3: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 2,
    color: color.dark_charcoal,
  },
};

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
        <h1 style={style.h1}>
          {i18n.addStudentsToSection({section: sectionName})}
        </h1>
        <h2 style={style.h2}>
          {i18n.addStudentsToSectionInstructions()}
        </h2>
        <h3 style={style.h3}>
          {i18n.addStudentsManageMyOwn()}
        </h3>
        <CardContainer>
          <PictureLoginCard/>
          <WordLoginCard/>
          <EmailLoginCard/>
        </CardContainer>
        {anyThirdParty && (
          <div>
            <h3 style={style.h3}>
              {i18n.addStudentsSyncThirdParty()}
            </h3>
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
