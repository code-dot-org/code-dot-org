import React from 'react';
import SectionSelectionDropdown from './SectionSelectionDropdown';

const sections = [
  {
    name: 'Assigned Section',
    id: 1,
    isAssigned: true
  },
  {
    name: 'Unassigned Section',
    id: 2,
    isAssigned: false
  },
  {
    name: 'Selected Section',
    id: 3,
    isAssigned: false
  }
];

export default storybook => {
  storybook.storiesOf('SectionSelectionDropdown', module).addStoryTable([
    {
      name: 'SectionSelectionDropdown',
      story: () => (
        <div>
          <SectionSelectionDropdown
            selectedSection={sections[2]}
            sections={sections}
          />
        </div>
      )
    }
  ]);
};
