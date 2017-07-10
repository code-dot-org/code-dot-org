import React, {Component, PropTypes} from 'react';
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
          Add students to: {sectionName}
        </h1>
        <h2 style={style.h2}>
          Choose how you want to add your students:
        </h2>
        <h3 style={style.h3}>
          Create and manage my own list of students
        </h3>
        <CardContainer>
          <PictureLoginCard/>
          <WordLoginCard/>
          <EmailLoginCard/>
        </CardContainer>
        {anyThirdParty && (
          <div>
            <h3 style={style.h3}>
              Sync my list of students from an existing classroom section in a third
              party tool
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
    title="Picture logins"
    subtitle="Recommended for ages 4 - 8"
    description="You will create accounts for your students. Students will log in with a secret picture."
    buttonText="Use picture logins"
    link="#"
    isRtl={false}
  />
);

const WordLoginCard = () => (
  <LoginTypeCard
    title="Word logins"
    subtitle="Recommended for ages 9 - 12"
    description="You will create accounts for your students. Students will log in with a secret pair of words."
    buttonText="Use word logins"
    link="#"
    isRtl={false}
  />
);

const EmailLoginCard = () => (
  <LoginTypeCard
    title="Email logins"
    subtitle="Recommended for ages 13+"
    description="Each student will create their own Code.org account using their email address."
    buttonText="Use email logins"
    link="#"
    isRtl={false}
  />
);

const GoogleClassroomCard = () => (
  <LoginTypeCard
    title="Google Classroom"
    description="Sync your Code.org section with an existing Google Classroom."
    buttonText="Use Google Classroom"
    link="#"
    isRtl={false}
  />
);

const MicrosoftClassroomCard = () => (
  <LoginTypeCard
    title="Microsoft Classroom"
    description="Sync your Code.org section with an existing Microsoft Classroom."
    buttonText="Use Microsoft Classroom"
    link="#"
    isRtl={false}
  />
);

const CleverCard = () => (
  <LoginTypeCard
    title="Clever"
    description="Sync your Code.org section with an existing Clever section."
    buttonText="Use Clever"
    link="#"
    isRtl={false}
  />
);
