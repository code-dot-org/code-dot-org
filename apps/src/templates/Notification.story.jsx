import React from 'react';
import Notification from './Notification';

const information = {
  notice: "Did you know Clark Kent grew up in Kansas?",
  details: "Seriously, Kansas. Earth's greatest hero is from a tiny called Smallville, if you can believe it.",
  dismissible: true,
  isRtl: false
};

const success = {
  notice: "Wonder Woman Saved the Day",
  details: "Things were pretty sketchy there for awhile, but don't worry- she's on top of it.",
  dismissible: true,
  isRtl: false
};

const failure = {
  notice: "Lex Luther Attacked Metropolis",
  details: "If you're in the Metropolis area, get to saftey as quickly as possible",
  dismissible: false,
  isRtl: false
};

const warning = {
  notice: "Batman is on Vacation in the Bahamas",
  details: "Now is probably not the best time to be in Gotham City. Watch your back.",
  dismissible: true,
  isRtl: false
};

const findCourse = {
  notice: "Find a course",
  details: "Try new courses to add them to your homepage.",
  dismissible: false,
  isRtl: false
};

const announcement = {
  notice: "Here is some news",
  details: "Here are the details of the news.",
  dismissible: false,
  isRtl: false
};

export default storybook => {
  return storybook
    .storiesOf('Notification', module)
    .addStoryTable([
      {
        name: 'Information - no button',
        description: `Notification box that displays information`,
        story: () => (
          <Notification
            type="information"
            {...information}
          />
        )
      },
      {
        name: 'Information - call to action button',
        description: `Notification box that displays information and a call to action button`,
        story: () => (
          <Notification
            type="information"
            {...information}
            buttonText= "Call to Action"
            buttonLink="to a new page"
            dismissible={false}
          />
        )
      },
      {
        name: 'Information - call to action button and dismissable',
        description: `Notification box that displays information and a call to action button`,
        story: () => (
          <Notification
            type="information"
            {...information}
            buttonText= "Call to Action"
            buttonLink="to a new page"
            dismissible={true}
          />
        )
      },
      {
        name: 'Information - call to action button RTL',
        description: `Notification box that displays information and a call to action button`,
        story: () => (
          <Notification
            type="information"
            {...information}
            buttonText= "Call to Action"
            buttonLink="to a new page"
            dismissible= {false}
            isRtl={true}
          />
        )
      },
      {
        name: 'Information - no button - nondefaultwidth',
        description: `Notification box that displays information`,
        story: () => (
          <Notification
            type="information"
            {...information}
            width={1100}
          />
        )
      },
      {
        name: 'Information - Lots of content',
        description: 'Should expand vertically',
        story: () => (
          <Notification
            type="information"
            {...information}
            details={information.details + information.details + information.details + information.details}
          />
        )
      },

      {
        name: 'Information - Fake mobile with width overriden',
        description: 'Should expand vertically',
        story: () => (
          <div style={{width: 400}}>
            <Notification
              type="information"
              notice="LongUnbreakingWord"
              details="Because our notice can't break, we should see our button wrap to below"
              buttonText="Call to Action"
              buttonLink="to a new page"
              dismissible={false}
              isRtl={false}
              width="100%"
            />
        </div>
        )
      },
      {
        name: 'Success',
        description: `Notification box that displays when there is a success`,
        story: () => (
          <Notification
            type="success"
            {...success}
          />
        )
      },
      {
        name: 'Failure',
        description: `Notification box that displays when there is a failure`,
        story: () => (
          <Notification
            type="failure"
            {...failure}
          />
        )
      },
      {
        name: 'Warning',
        description: `Notification box that displays when there is a warning`,
        story: () => (
          <Notification
            type="warning"
            {...warning}
          />
        )
      },
      {
        name: 'Find a Course',
        description: `Notification box that displays when there is a warning`,
        story: () => (
          <Notification
            type="course"
            {...findCourse}
            buttonText="Find a course"
            buttonLink="/courses"
          />
        )
      },
      {
        name: 'Announcement',
        description: `Notification box that displays when there is an announcement`,
        story: () => (
          <Notification
            type="bullhorn"
            {...announcement}
            buttonText="Learn more"
            buttonLink="/"
            newWindow={true}
            analyticId="sample_announcement"
          />
        )
      },
    ]);
};
