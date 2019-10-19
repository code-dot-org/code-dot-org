import React from 'react';
import TeacherSectionSelector from './TeacherSectionSelector';
import {action} from '@storybook/addon-actions';
import {fakeTeacherSectionsForDropdown} from './sectionAssignmentTestHelper';

export default storybook => {
  storybook.storiesOf('TeacherSectionSelector', module).addStoryTable([
    {
      name: 'TeacherSectionSelector',
      story: () => (
        <div>
          <TeacherSectionSelector
            selectedSection={fakeTeacherSectionsForDropdown[0]}
            sections={fakeTeacherSectionsForDropdown}
            onChangeSection={action('changeSection')}
          />
        </div>
      )
    }
  ]);
};
