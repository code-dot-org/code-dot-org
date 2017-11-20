import React from 'react';
import ResourceCard from './ResourceCard';

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
      {
        name: 'tool card - allow wrap',
        description: `This is an example tool card that allows the title to wrap.`,
        story: () => (
          <ResourceCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            buttonText= "Connect Today"
            link= "link to teacher community"
            isRtl={false}
            allowWrap={true}
          />
        )
      },
      {
        name: 'tool card - allow wrap, RTL',
        description: `This is an example RTL tool card that allows the title to wrap.`,
        story: () => (
          <ResourceCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            buttonText= "Connect Today"
            link= "link to teacher community"
            isRtl={true}
            allowWrap={true}
          />
        )
      },
    ]);
};
