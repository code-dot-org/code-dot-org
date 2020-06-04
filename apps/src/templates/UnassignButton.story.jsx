import React from 'react';
import {action} from '@storybook/addon-actions';
import {UnconnectedUnassignButton as UnassignButton} from './UnassignButton';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

const assignedSection = fakeTeacherSectionsForDropdown[1];
export default storybook => {
  storybook.storiesOf('Buttons/UnassignButton', module).addStoryTable([
    {
      name: 'UnassignButton',
      story: () => (
        <UnassignButton
          sectionId={assignedSection.id}
          unassignSection={action('unassignSection')}
        />
      )
    }
  ]);
};
