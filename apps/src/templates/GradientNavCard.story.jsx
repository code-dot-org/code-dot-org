import React from 'react';
import GradientNavCard from './GradientNavCard';

const EXAMPLE_CARD_DATA = {
  title: "Teacher Community",
  description: "Ask questions about curriculum, share ideas from your lessons, and get help from other teachers",
  image: "./GradientCardTestPic-REMOVE.jpg",
  buttonText: "Connect Today"
};

export default storybook => {
  return storybook
    .storiesOf('GradientNavCard', module)
    .addStoryTable([
      {
        name: 'basic navigation card',
        description: `This is an example navigation card with stub data.`,
        story: () => (
          <GradientNavCard
            cardData={EXAMPLE_CARD_DATA}
          />
        )
      },
    ]);
};
