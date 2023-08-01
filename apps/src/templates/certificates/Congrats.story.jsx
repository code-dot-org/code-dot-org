import React from 'react';
import Congrats from './Congrats';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'Congrats/Congrats',
  component: Congrats,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <Congrats
      initialCertificateImageUrl={'/images/placeholder-hoc-image.jpg'}
      language="en"
      tutorial="other"
      isHocTutorial={true}
      {...args}
    />
  </Provider>
);

export const EnglishTeacherHOCTutorial = Template.bind({});
EnglishTeacherHOCTutorial.args = {
  userType: 'teacher',
};

export const EnglishStudentHOCTutorial = Template.bind({});
EnglishStudentHOCTutorial.args = {
  userType: 'student',
};

export const EnglishSignedOutHOCTutorial = Template.bind({});
EnglishSignedOutHOCTutorial.args = {
  userType: 'signedOut',
};

export const EnglishStudentOtherTutorial = Template.bind({});
EnglishStudentOtherTutorial.args = {
  userType: 'student',
  isHocTutorial: false,
};

export const NonEnglishStudentHOCTutorial = Template.bind({});
NonEnglishStudentHOCTutorial.args = {
  userType: 'student',
  language: 'ko',
};
