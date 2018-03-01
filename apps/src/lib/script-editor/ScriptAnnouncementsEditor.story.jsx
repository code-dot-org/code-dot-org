import React from 'react';
import ScriptAnnouncementsEditor from './ScriptAnnouncementsEditor';

const announcements = [
  {
    notice: "This course has recently been updated!",
    details: "See what changed and how it may affect your classroom.",
    link: "https://support.code.org/hc/en-us/articles/115001931251",
    type: "information"
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
    .storiesOf('ScriptAnnouncementsEditor', module)
    .withReduxStore()
    .addStoryTable([
      {
        name:'ScriptAnnouncementsEditor',
        story: () => (
          <ScriptAnnouncementsEditor
            defaultAnnouncements={announcements}
            inputStyle={inputStyle}
          />
        )
      }
    ]);
};
