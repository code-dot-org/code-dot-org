import React from 'react';
import EligibilityChecklist from './EligibilityChecklist';
import {Status} from '../lib/ui/ValidationStep';

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
      {
        name: 'Ineligible year submitted',
        description: 'User had submitted an ineligible response for unit 6 intentions',
        story: () => (
          <EligibilityChecklist
            statusPD={Status.SUCCEEDED}
            statusStudentCount={Status.SUCCEEDED}
            unit6Intention="no"
          />
        )
      },
      {
        name: 'Eligible year submitted',
        description: 'User had submitted an eligible response for unit 6 intentions',
        story: () => (
          <EligibilityChecklist
            statusPD={Status.SUCCEEDED}
            statusStudentCount={Status.SUCCEEDED}
            unit6Intention="yes1718"
          />
        )
      },
    ]);
};
