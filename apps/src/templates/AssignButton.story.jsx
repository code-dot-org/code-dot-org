import React from 'react';
import {action} from '@storybook/addon-actions';
import {UnconnectedAssignButton as AssignButton} from './AssignButton';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

export default {
  title: 'AssignButton',
  component: AssignButton,
};

export const Basic = () => (
  <AssignButton
    sectionId={fakeTeacherSectionsForDropdown[0].id}
    courseId={100}
    scriptId={20}
    assignToSection={action('assignToSection')}
    updateHiddenScript={action('updateHiddenScript')}
  />
);
