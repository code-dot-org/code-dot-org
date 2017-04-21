import React from 'react';
import AnnouncementsCarousel from './AnnouncementsCarousel';
import Announcement from './Announcement';

export default storybook => {
  return storybook
  .storiesOf('AnnoucementsCarousel', module)
  .addStoryTable([
    {
      name: 'Annoucements Carousel - 3 announcements',
      description: 'Container that allows users to click through many Announcements.',
      story: () => (
        <AnnouncementsCarousel>
          <Announcement
            heading="Announcement 1"
            buttonText="Go Beyond"
            description= "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom."
            link="to wherever"
          />
          <Announcement
            heading="Announcement 2"
            buttonText="Go Beyond"
            description= "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom."
            link="to wherever"
          />
          <Announcement
            heading="Announcement 3"
            buttonText="Go Beyond"
            description= "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom."
            link="to wherever"
          />
        </AnnouncementsCarousel>
      )
    },
    {
      name: 'Announcements Carousel - 2 announcements',
      description: 'Container that allows users to click through many Announcements.',
      story: () => (
        <AnnouncementsCarousel>
          <Announcement
            heading="Announcement 1"
            buttonText="Go Beyond"
            description= "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom."
            link="to wherever"
          />
          <Announcement
            heading="Announcement 2"
            buttonText="Go Beyond"
            description= "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom."
            link="to wherever"
          />
        </AnnouncementsCarousel>
      )
    },
    {
      name: 'Annoucements Carousel - 1 announcement',
      description: 'Displays one announcement, but NOT white arrows.',
      story: () => (
        <AnnouncementsCarousel>
          <Announcement
            heading="Announcement 1"
            buttonText="Go Beyond"
            description= "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom."
            link="to wherever"
          />
        </AnnouncementsCarousel>
      )
    },
  ]);
};
