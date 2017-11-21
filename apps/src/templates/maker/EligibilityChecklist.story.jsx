import React from 'react';
import EligibilityChecklist from './EligibilityChecklist';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';

const defaultProps = {
  statusPD: Status.SUCCEEDED,
  statusStudentCount: Status.SUCCEEDED,
  hasConfirmedSchool: false,
};

export default storybook => {
  return storybook
    .storiesOf('EligibilityChecklist', module)
    .addStoryTable([
      {
        name: 'Failed Checklist',
        description: 'EligbilityChecklist where one of first list items failed',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            statusStudentCount={Status.FAILED}
          />
        )
      },
      {
        name: 'Check Year Checklist',
        description: 'First two items succeeded, third needs to be verified',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
          />
        )
      },
      {
        name: 'Ineligible year submitted',
        description: 'User had submitted an ineligible response for unit 6 intentions',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            unit6Intention="no"
          />
        )
      },
      {
        name: 'Eligible year submitted',
        description: 'User had submitted an eligible response for unit 6 intentions',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            unit6Intention="yes1718"
          />
        )
      },
    ]);
};
