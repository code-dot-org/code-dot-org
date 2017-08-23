import React from 'react';
import { UnconnectedResourceCard as ResourceCard } from './ResourceCard';

export default storybook => {
  return storybook
    .storiesOf('ResourceCard', module)
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
            isRtl={false}
          />
        )
      },
      {
        name: 'tool card - RTL',
        description: `This is an example tool card with RTL styling.`,
        story: () => (
          <ResourceCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            buttonText= "Connect Today"
            link= "link to teacher community"
            isRtl={true}
          />
        )
      },
    ]);
};
