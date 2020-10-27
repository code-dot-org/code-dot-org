import React from 'react';
import {Provider} from 'react-redux';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import googlePlatformApi, {
  loadGooglePlatformApi
} from '@cdo/apps/templates/progress/googlePlatformApiRedux';
import SendLessonDialog from './SendLessonDialog';
import ExampleDialogButton from '@cdo/apps/util/ExampleDialogButton';

const createStore = () => {
  registerReducers({googlePlatformApi});
  const store = createStoreWithReducers();
  store.dispatch(loadGooglePlatformApi());
  return store;
};

export default storybook => {
  return storybook.storiesOf('SendLessonDialog', module).addStoryTable([
    {
      name: 'with copy to clipboard and google buttons',
      story: () => {
        const store = createStore();
        return (
          <Provider store={store}>
            <ExampleDialogButton>
              <SendLessonDialog lessonUrl="https://studio.code.org/s/coursee-2020/stage/2/puzzle/1" />
            </ExampleDialogButton>
          </Provider>
        );
      }
    }
  ]);
};
