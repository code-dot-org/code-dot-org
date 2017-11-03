import React from 'react';
import EligibilityChecklist from './EligibilityChecklist';
import {Status} from '../lib/kits/maker/ui/SetupStep';

export default storybook => {
  return storybook
    .storiesOf('EligibilityChecklist', module)
    .addStoryTable([
      {
        name: 'Failed Checklist',
        description: 'EligbilityChecklist where one of first list items failed',
        story: () => (
          <EligibilityChecklist
            statusPD={Status.SUCCEEDED}
            statusStudentCount={Status.FAILED}
          />
        )
      },
      {
        name: 'Check Year Checklist',
        description: 'First two items succeeded, third needs to be verified',
        story: () => (
          <EligibilityChecklist
            statusPD={Status.SUCCEEDED}
            statusStudentCount={Status.SUCCEEDED}
          />
        )
      },
    ]);
};
