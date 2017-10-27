import React from 'react';
import CoursePromoCard from './CoursePromoCard';

const exampleCard = {
  title: "CS Fundamental Express",
  description: "All the core concepts from the elementary school curriculum, but at an accelerated pace designed for older students.",
  buttonText: "Start the course",
  link: "/s/express",
};

export default storybook => {
  return storybook
    .storiesOf('CoursePromoCard', module)
    .addStoryTable([
      {
        name: 'Course Promo Card',
        description: `This is an example course promo card that can be used to promote a course`,
        story: () => (
          <CoursePromoCard
            title={exampleCard.title}
            description={exampleCard.description}
            buttonText={exampleCard.buttonText}
            link={exampleCard.link}
            isRtl={false}
          />
        )
      },
      {
        name: 'Course Promo Card - RTL',
        description: `This is an example course promo card that can be used to promote a course in RTL language`,
        story: () => (
          <CoursePromoCard
            title={exampleCard.title}
            description={exampleCard.description}
            buttonText={exampleCard.buttonText}
            link={exampleCard.link}
            isRtl={true}
          />
        )
      }
    ]);
};
