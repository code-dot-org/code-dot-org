import React from 'react';
import {createStore, combineReducers} from 'redux';
import { Provider } from 'react-redux';
import PublishDialog from './PublishDialog';
import publishDialog, { showPublishDialog, PUBLISH_REQUEST } from './publishDialogRedux';

const PROJECT_ID = 'MY_PROJECT_ID';
const PROJECT_TYPE = 'MY_PROJECT_TYPE';

function configureStore() {
  return createStore(combineReducers({publishDialog}));
}

export default storybook => {
  return storybook
    .storiesOf('PublishDialog', module)
    .addStoryTable([
      {
        name: 'dialog open',
        description: '',
        story: () => {
          const store = configureStore();
          store.dispatch(showPublishDialog(PROJECT_ID, PROJECT_TYPE));
          return (
            <Provider store={store}>
              <PublishDialog
                onConfirmPublish={storybook.action('publish')}
                onClose={storybook.action('close')}
              />
            </Provider>
          );
        }
      },
      {
        name: 'dialog open with publish pending',
        description: '',
        story: () => {
          const store = configureStore();
          store.dispatch(showPublishDialog(PROJECT_ID, PROJECT_TYPE));
          store.dispatch({type: PUBLISH_REQUEST});
          return (
            <Provider store={store}>
              <PublishDialog
                onConfirmPublish={storybook.action('publish')}
                onClose={storybook.action('close')}
              />
            </Provider>
          );
        }
      }
    ]);
};
