import React from 'react';
import {UnconnectedSectionAssigner as SectionAssigner} from './SectionAssigner';
import {action} from '@storybook/addon-actions';
import {fakeTeacherSectionsForDropdown} from './sectionAssignmentTestHelper';

export default storybook => {
  storybook.storiesOf('SectionAssigner', module).addStoryTable([
    {
      name: 'SectionAssigner',
      story: () => (
        <div>
          <SectionAssigner
            selectedSectionId={fakeTeacherSectionsForDropdown[0].id}
            sections={fakeTeacherSectionsForDropdown}
            selectSection={action('selectSection')}
          />
        </div>
      )
    }
  ]);
};
