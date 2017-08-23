import React from 'react';
import ImageResourceCard from './ImageResourceCard';

export default storybook => {
  return storybook
    .storiesOf('ImageResourceCard', module)
    .addStoryTable([
      {
        name: 'basic resource card',
        description: `This is an example resource card.`,
        story: () => (
          <ImageResourceCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            image="teacher-community"
            buttonText= "Connect Today"
            link= "link to teacher community"
            isRtl={false}
          />
        )
      },
      {
        name: 'basic resource card - RTL',
        description: `This is an example resource card with RTL styling.`,
        story: () => (
          <ImageResourceCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            image="teacher-community"
            buttonText= "Connect Today"
            link= "link to teacher community"
            isRtl={true}
          />
        )
      },
    ]);
};
