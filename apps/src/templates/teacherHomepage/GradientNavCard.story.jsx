import React from 'react';
import GradientNavCard from './GradientNavCard';

export default storybook => {
  return storybook
    .storiesOf('GradientNavCard', module)
    .addStoryTable([
      {
        name: 'basic navigation card',
        description: `This is an example navigation card with stub data.`,
        story: () => (
          <GradientNavCard
            title= "Teacher Community"
            description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
            image="../../static/navcard-placeholder.png"
            buttonText= "Connect Today"
            link= "link to teacher community"
          />
        )
      },
    ]);
};
