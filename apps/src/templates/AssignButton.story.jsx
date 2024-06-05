import {action} from '@storybook/addon-actions';
import React from 'react';

import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

import {UnconnectedAssignButton as AssignButton} from './AssignButton';

export default {
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
