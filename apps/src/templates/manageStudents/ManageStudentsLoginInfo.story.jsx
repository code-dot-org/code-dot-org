import React from 'react';
import ManageStudentsLoginInfo from './ManageStudentsLoginInfo';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

export default storybook => {
  storybook = storybook.storiesOf('ManageStudentsLoginInfo', module);

  Object.values(SectionLoginType).forEach(loginType => {
    storybook = storybook.add(loginType, () => (
      <ManageStudentsLoginInfo
        sectionId={7}
        sectionCode="ABCDEF"
        loginType={loginType}
        studioUrlPrefix="http://localhost-studio.code.org:3000"
      />
    ));
  });
};
