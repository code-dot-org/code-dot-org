import React from 'react';
import {action} from '@storybook/addon-actions';
import AssignmentVersionSelector from './AssignmentVersionSelector';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

const styles = {
  dropdown: {
    padding: '0.3em'
  }
};

export default storybook => {
  storybook.storiesOf('AssignmentVersionSelector', module).addStoryTable([
    {
      name: 'with popup menu',
      story: () => {
        return (
          <AssignmentVersionSelector
            dropdownStyle={styles.dropdown}
            onChangeVersion={action('onChangeVersion')}
            courseVersions={courseOfferings['1'].course_versions}
            selectedCourseVersionId={1}
          />
        );
      }
    },
    {
      name: 'with popup menu, disabled',
      story: () => {
        return (
          <AssignmentVersionSelector
            dropdownStyle={styles.dropdown}
            onChangeVersion={action('onChangeVersion')}
            courseVersions={courseOfferings['1'].course_versions}
            selectedCourseVersionId={1}
            disabled
          />
        );
      }
    }
  ]);
};
