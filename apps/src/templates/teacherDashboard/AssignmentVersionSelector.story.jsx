import {action} from '@storybook/addon-actions';
import React from 'react';

import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

import AssignmentVersionSelector from './AssignmentVersionSelector';

export default {
  component: AssignmentVersionSelector,
};

const styles = {
  dropdown: {
    padding: '0.3em',
  },
};

const Template = args => (
  <AssignmentVersionSelector
    onChangeVersion={action('onChangeVersion')}
    courseVersions={courseOfferings['1'].course_versions}
    selectedCourseVersionId={1}
    {...args}
  />
);

export const Enabled = Template.bind({});
Enabled.args = {
  dropdownStyle: styles.dropdown,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  dropdownStyle: styles.dropdown,
};

export const EnabledNoStyling = Template.bind({});
