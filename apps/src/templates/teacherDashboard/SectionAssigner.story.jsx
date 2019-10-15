import React from 'react';
import SectionAssigner from './SectionAssigner';
import {fakeTeacherSectionsForDropdown} from './sectionAssignmentTestHelper';

export default storybook => {
  storybook.storiesOf('SectionAssigner', module).addStoryTable([
    {
      name: 'SectionAssigner',
      story: () => (
        <div>
          <SectionAssigner
            initialSelectedSection={fakeTeacherSectionsForDropdown[0]}
            sections={fakeTeacherSectionsForDropdown}
          />
        </div>
      )
    }
  ]);
};
