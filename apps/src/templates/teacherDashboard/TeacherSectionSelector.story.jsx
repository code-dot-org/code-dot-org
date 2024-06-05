import {action} from '@storybook/addon-actions';
import React from 'react';

import {fakeTeacherSectionsForDropdown} from './sectionAssignmentTestHelper';
import TeacherSectionSelector from './TeacherSectionSelector';

export default {
  component: TeacherSectionSelector,
};

export const Basic = () => (
  <div>
    <TeacherSectionSelector
      selectedSection={fakeTeacherSectionsForDropdown[0]}
      sections={fakeTeacherSectionsForDropdown}
      onChangeSection={action('changeSection')}
    />
  </div>
);
