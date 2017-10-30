import React from 'react';
import EligibilityChecklist from './EligibilityChecklist';

export default storybook => {
  return storybook
    .storiesOf('EligibilityChecklist', module)
    .addStoryTable([
      {
        name: 'Checklist',
        description: 'EligbilityChecklist',
        story: () => (
          <EligibilityChecklist/>
        )
      },
    ]);
};
