import React from 'react';
import {action} from '@storybook/addon-actions';
import {UnconnectedUnassignSectionButton as UnassignSectionButton} from './UnassignSectionButton';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

const assignedSection = fakeTeacherSectionsForDropdown[1];
export default storybook => {
  storybook.storiesOf('Buttons/UnassignSectionButton', module).addStoryTable([
    {
      name: 'UnassignSectionButton',
      story: () => (
        <UnassignSectionButton
          sectionId={assignedSection.id}
          unassignSection={action('unassignSection')}
        />
      )
    }
  ]);
};
