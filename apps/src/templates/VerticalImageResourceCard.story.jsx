import React from 'react';
import VerticalImageResourceCard from './VerticalImageResourceCard';

const exampleCard = {
  title: "CS Fundamentals Express",
  description: "All the core concepts from the elementary school curriculum, but at an accelerated pace designed for older students.",
  buttonText: "Start the course",
  link: "/s/express",
};

export default storybook => {
  return storybook
    .storiesOf('VerticalImageResourceCard', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Vertical Image Resource Card',
        description: `This is an example card that fits 3 across on desktop and has an image stacked above a desctription and button. It's used here to promote a course`,
        story: () => (
          <VerticalImageResourceCard
            title={exampleCard.title}
            description={exampleCard.description}
            buttonText={exampleCard.buttonText}
            link={exampleCard.link}
            image="csf-express"
          />
        )
      },
      {
        name: 'Vertical Image Resource Card - Jumbo',
        description: `This is an example card that fits 2 across on desktop and has an image stacked above a desctription and button. It's used here to promote a course`,
        story: () => (
          <VerticalImageResourceCard
            title={exampleCard.title}
            description={exampleCard.description}
            buttonText={exampleCard.buttonText}
            link={exampleCard.link}
            jumbo={true}
            image="codeorg-teacher"
          />
        )
      },
      {
        name: 'Vertical Image Resource Card - RTL',
        description: `This is an example vertical image resource card that can be used with in RTL styling`,
        story: () => (
          <VerticalImageResourceCard
            title={exampleCard.title}
            description={exampleCard.description}
            buttonText={exampleCard.buttonText}
            link={exampleCard.link}
            image="csf-express"
          />
        )
      },
      {
        name: 'Minecraft Vertical Image Resource Card',
        description: `This is an example Minecraft Vertical Image Resource Card, includes share link for Minecraft education`,
        story: () => (
          <VerticalImageResourceCard
            title="Minecraft Education"
            description="Copy the link below to continue programming with Minecraft."
            buttonText="Go to Minecraft"
            link="https://minecraft.net/en-us/"
            MCShareLink="code.org/sharelink"
            image="new-minecraft"
          />
        )
      }
    ]);
};
