import {action} from '@storybook/addon-actions';
import React from 'react';

import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

import {UnconnectedUnassignSectionButton as UnassignSectionButton} from './UnassignSectionButton';

const assignedSection = fakeTeacherSectionsForDropdown[1];

export default {
  component: UnassignSectionButton,
};

export const Default = () => (
  <UnassignSectionButton
    sectionId={assignedSection.id}
    unassignSection={action('unassignSection')}
  />
);
