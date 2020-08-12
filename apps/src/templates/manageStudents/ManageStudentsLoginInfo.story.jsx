import React from 'react';
import ManageStudentsLoginInfo from './ManageStudentsLoginInfo';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

const studentData = [
  {
    id: 1,
    name: 'studenta',
    username: 'studenta',
    userType: 'student',
    secretWords: 'secret words',
    secretPicturePath: 'wizard.jpg'
  }
];

export default storybook => {
  storybook = storybook.storiesOf('ManageStudentsLoginInfo', module);

  Object.values(SectionLoginType).forEach(loginType => {
    console.log(studentData);
    storybook = storybook.add(loginType, () => (
      <ManageStudentsLoginInfo
        sectionId={7}
        sectionCode="ABCDEF"
        sectionName="Name"
        loginType={loginType}
        studioUrlPrefix="http://localhost-studio.code.org:3000"
        studentData={studentData}
      />
    ));
  });
};
