import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import ChildSectionsWarningNotification from './ChildSectionsWarningNotification';
export default {
  component: ChildSectionsWarningNotification,
};

//
// TEMPLATE
//

const Template: StoryFn<typeof ChildSectionsWarningNotification> = args => (
  <Provider store={reduxStore()}>
    <ChildSectionsWarningNotification />
  </Provider>
);

//
// STORIES
//

export const DefaultStory = Template.bind({});
