import React from 'react';
import TeacherSectionSelector from './TeacherSectionSelector';
import {action} from '@storybook/addon-actions';
import {fakeTeacherSectionsForDropdown} from './sectionAssignmentTestHelper';

export default {
  title: 'TeacherSectionSelector',
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
