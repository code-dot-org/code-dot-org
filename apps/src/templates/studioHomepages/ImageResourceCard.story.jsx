import React from 'react';
import ImageResourceCard from './ImageResourceCard';

export default storybook => {
  return storybook
    .storiesOf('ImageResourceCard', module)
    .withReduxStore()
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
          />
        )
      },
    ]);
};
