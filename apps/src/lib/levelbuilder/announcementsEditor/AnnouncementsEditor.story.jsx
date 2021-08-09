import React from 'react';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';

const announcements = [
  {
    notice: 'This course has recently been updated!',
    details: 'See what changed and how it may affect your classroom.',
    link: 'https://support.code.org/hc/en-us/articles/115001931251',
    type: 'information',
    visibility: 'Teacher-only'
  },
  {
    notice: 'There is new hour of code tutorials!',
    details: 'Try a new tutorial today',
    link: 'https://support.code.org/hc/en-us/articles/115001931251',
    type: 'information',
    visibility: 'Student-only'
  },
  {
    notice: 'The AP is coming!',
    details: "Don't forget about the AP",
    link: 'https://support.code.org/hc/en-us/articles/115001931251',
    type: 'information',
    visibility: 'Teacher and student'
  }
];

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '4px 6px',
  color: '#555',
  border: '1px solid #ccc',
  borderRadius: 4
};

export default storybook => {
  storybook
    .storiesOf('AnnouncementsEditor', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'AnnouncementsEditor',
        story: () => (
          <AnnouncementsEditor
            announcements={announcements}
            inputStyle={inputStyle}
            updateAnnouncements={() => {
              console.log('update announcements');
            }}
          />
        )
      }
    ]);
};
