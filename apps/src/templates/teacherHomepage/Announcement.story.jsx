import React from 'react';
import Announcement from './Announcement';

export default storybook => {
  return storybook
    .storiesOf('Announcement', module)
    .addStoryTable([
      {
        name: 'basic announcement',
        description: `This is an example announcement for the teacher homepage.`,
        story: () => (
          <Announcement
            heading="Go beyond an Hour of Code"
            buttonText="Go Beyond"
            description= "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom."
            link="http://teacherblog.code.org/"
          />
        )
      },
    ]);
};
