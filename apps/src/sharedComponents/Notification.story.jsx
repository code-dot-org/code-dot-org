import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import Notification from './Notification';

export default {
  component: Notification,
};

const informationDetails =
  "Seriously, Kansas. Earth's greatest hero is from a tiny town called Smallville, if you can believe it. ";

//
// TEMPLATE
//

const Template = args => (
  <Provider store={reduxStore()}>
    <Notification {...args} />
  </Provider>
);

//
// STORIES
//

export const Information = Template.bind({});
Information.args = {
  type: 'bullhorn',
  notice: 'Here is some news',
  details: 'Here are the details of the news.',
  dismissible: false,
};

export const InfoCallToActionButton = Template.bind({});
InfoCallToActionButton.args = {
  ...Information.args,
  buttonText: 'Call to Action',
  buttonLink: 'to a new page',
  dismissible: false,
};
InfoCallToActionButton.storyName = 'Information - call-to-action button';

export const InfoCallToActionButtonAndDismissible = Template.bind({});
InfoCallToActionButtonAndDismissible.args = {
  ...Information.args,
  buttonText: 'Call to Action',
  buttonLink: 'to a new page',
  dismissible: true,
};
InfoCallToActionButtonAndDismissible.storyName =
  'Information - call-to-action button, dismissible';

export const InfoNonDefaultWidth = Template.bind({});
InfoNonDefaultWidth.args = {
  ...Information.args,
  width: 800,
};
InfoNonDefaultWidth.storyName = 'Information - non-default width';

export const InfoLongDetails = Template.bind({});
InfoLongDetails.args = {
  ...Information.args,
  details:
    informationDetails +
    informationDetails +
    informationDetails +
    informationDetails,
};
InfoLongDetails.storyName = 'Information - long details';

export const InfoMobileWidth = args => (
  <Provider store={reduxStore()}>
    <div style={{width: 400}}>
      <Notification {...args} />
    </div>
  </Provider>
);
InfoMobileWidth.args = {
  ...Information.args,
  notice: 'LongUnbreakingWord',
  details:
    "Because our notice can't break, we should see our button wrap to below",
  buttonText: 'Call to Action',
  buttonLink: 'to a new page',
  dismissible: false,
  width: '100%',
};
InfoMobileWidth.storyName = 'Information - mobile width';

export const Success = Template.bind({});
Success.args = {
  type: 'success',
  notice: 'Wonder Woman Saved the Day',
  details:
    "Things were pretty sketchy there for awhile, but don't worry- she's on top of it.",
  dismissible: true,
};

export const Failure = Template.bind({});
Failure.args = {
  type: 'failure',
  notice: 'Lex Luther Attacked Metropolis',
  details:
    "If you're in the Metropolis area, get to saftey as quickly as possible",
  dismissible: false,
};

export const Warning = Template.bind({});
Warning.args = {
  type: 'warning',
  notice: 'Batman is on Vacation in the Bahamas',
  details:
    'Now is probably not the best time to be in Gotham City. Watch your back.',
  dismissible: true,
};

export const FindACourse = Template.bind({});
FindACourse.args = {
  type: 'course',
  notice: 'Find a course',
  details: 'Try new courses to add them to your homepage.',
  dismissible: false,
  buttonText: 'Find a course',
  buttonLink: '/courses',
};

export const Announcement = Template.bind({});
Announcement.args = {
  type: 'bullhorn',
  notice: 'Here is some news',
  details: 'Here are the details of the news.',
  dismissible: false,
};

export const AnnouncementWithButton = Template.bind({});
AnnouncementWithButton.args = {
  ...Announcement.args,
  buttonText: 'Learn more',
  buttonLink: '/',
  newWindow: true,
  firehoseAnalyticsData: {
    user_id: 1,
    important_data_point: 2,
  },
};
AnnouncementWithButton.storyName = 'Announcement - with button';

export const AnnouncementTwoButtonsAndALink = Template.bind({});
AnnouncementTwoButtonsAndALink.args = {
  ...Announcement.args,
  detailsLinkText: "And here's an extra link.",
  detailsLink: '/',
  buttons: [
    {
      text: 'Learn more',
      link: '/more',
      newWindow: true,
      onClick: action('onClickPopupMore'),
    },
    {
      text: 'Learn less',
      link: '/less',
      newWindow: true,
      onClick: action('onClickPopupLess'),
    },
  ],
};
AnnouncementTwoButtonsAndALink.storyName =
  'Announcement - two buttons and a link';
