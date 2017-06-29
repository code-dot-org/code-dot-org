import React from 'react';
import ResourceCard from './ResourceCard';

export default storybook => {
  return storybook
    .storiesOf('ResourceCard', module)
    .addStoryTable([
      {
        name: 'basic resource card',
        description: `This is an example resource card with fake data.`,
        story: () => (
          <ResourceCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            image="teacher-community"
            buttonText= "Connect Today"
            link= "link to teacher community"
            isRtl={false}
          />
        )
      },
    ]);
};
