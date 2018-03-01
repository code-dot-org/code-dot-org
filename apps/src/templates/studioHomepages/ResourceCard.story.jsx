import React from 'react';
import ResourceCard from './ResourceCard';

export default storybook => {
  return storybook
    .storiesOf('Cards/ResourceCard', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'tool card',
        description: `This is an example tool card.`,
        story: () => (
          <ResourceCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            buttonText= "Connect Today"
            link= "link to teacher community"
          />
        )
      },
      {
        name: 'tool card - allow wrap',
        description: `This is an example tool card that allows the title to wrap.`,
        story: () => (
          <ResourceCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            buttonText= "Connect Today"
            link= "link to teacher community"
            allowWrap={true}
          />
        )
      },
    ]);
};
