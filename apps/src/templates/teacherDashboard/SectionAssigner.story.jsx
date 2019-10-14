import React from 'react';
import SectionAssigner from './SectionAssigner';

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
  storybook.storiesOf('SectionAssigner', module).addStoryTable([
    {
      name: 'SectionAssigner',
      story: () => (
        <div>
          <SectionAssigner selectedSection={sections[0]} sections={sections} />
        </div>
      )
    }
  ]);
};
