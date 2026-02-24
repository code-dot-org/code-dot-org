import React from 'react';
import {Provider} from 'react-redux';

import AnnouncementsEditor from '@cdo/apps/levelbuilder/announcementsEditor/AnnouncementsEditor';
import {reduxStore} from '@cdo/storybook/decorators';

const announcements = [
  {
    notice: 'This course has recently been updated!',
    details: 'See what changed and how it may affect your classroom.',
    link: 'https://support.code.org/hc/en-us/articles/115001931251',
    type: 'information',
    visibility: 'Teacher-only',
  },
  {
    notice: 'There is new hour of code tutorials!',
    details: 'Try a new tutorial today',
    link: 'https://support.code.org/hc/en-us/articles/115001931251',
    type: 'bullhorn',
    visibility: 'Student-only',
  },
  {
    notice: 'The AP is coming!',
    details: "Don't forget about the AP",
    link: 'https://support.code.org/hc/en-us/articles/115001931251',
    type: 'warning',
    visibility: 'Teacher and student',
  },
];

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '4px 6px',
  color: '#555',
  border: '1px solid #ccc',
  borderRadius: 4,
};

export default {
  component: AnnouncementsEditor,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <AnnouncementsEditor {...args} />
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  announcements,
  inputStyle,
  updateAnnouncements: () => console.log('update announcements'),
};
