import React from 'react';
import AnnouncementsCollapsible from './AnnouncementsCollapsible';

export default storybook => {
  return storybook
    .storiesOf('AnnouncementsCollapsible', module)
    .addStoryTable([
      {
        name: 'Announcement Collapsible - 1 announcement',
        description: 'This is an example of of the Announcements section for the teacher homepage.',
        story: () => (
          <AnnouncementsCollapsible
            announcements={[
              {
                heading: "Go beyond an Hour of Code",
                buttonText: "Go Beyond",
                description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
                link: "to wherever"
              }
            ]}
          />
        )
      }
    ]);
};
