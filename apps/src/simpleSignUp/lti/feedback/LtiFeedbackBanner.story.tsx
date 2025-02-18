import {StoryFn, Meta} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import {BANNER_STATUS} from '@cdo/apps/sharedComponents/userFeedback/FeedbackBanner';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import {trySetLocalStorage} from '@cdo/apps/utils';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

import LtiFeedbackBanner from './LtiFeedbackBanner';

const store = getStore();
const currentUserUuid = 'currentUserUuid';
const feedbackBannerKey = `lti-fb-${currentUserUuid}`;
registerReducers({currentUser});
store.dispatch(
  setInitialData({
    id: 1,
    uuid: currentUserUuid,
    is_lti: true,
    user_type: UserTypes.TEACHER,
  })
);

export default {
  component: LtiFeedbackBanner,
  decorators: [
    (Story: StoryFn) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
} as Meta;

export const Unanswered: StoryFn = () => {
  trySetLocalStorage(feedbackBannerKey, BANNER_STATUS.UNANSWERED);
  return <LtiFeedbackBanner />;
};

export const Answered: StoryFn = () => {
  trySetLocalStorage(feedbackBannerKey, BANNER_STATUS.ANSWERED);
  return <LtiFeedbackBanner />;
};
