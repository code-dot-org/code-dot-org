import React from 'react';
import {Provider} from 'react-redux';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import googlePlatformApi, {
  loadGooglePlatformApi
} from '@cdo/apps/templates/progress/googlePlatformApiRedux';
import SendLesson from './SendLesson';

const createStore = () => {
  registerReducers({googlePlatformApi});
  const store = createStoreWithReducers();
  store.dispatch(loadGooglePlatformApi());
  return store;
};

export default {
  name: 'SendLesson',
  component: SendLesson
};

const Template = args => {
  const store = createStore();
  return (
    <Provider store={store}>
      <SendLesson {...args} />
    </Provider>
  );
};

export const WithOnlyRequiredProps = Template.bind({});
WithOnlyRequiredProps.args = {
  lessonUrl:
    'https://studio.code.org/s/coursee-2020/lessons/2/levels/1?login_required=true'
};

export const WithAllProps = Template.bind({});
WithAllProps.args = {
  lessonUrl:
    'https://studio.code.org/s/coursee-2020/lessons/2/levels/1?login_required: true',
  lessonTitle: 'Sequencing in the Maze',
  courseid: 12345,
  analyticsData:
    '{"script_name":"coursee-2020","section_id":7,"lesson_id":1050,"lesson_name":"Sequencing in the Maze"}',
  buttonStyle: {margin: 0}
};
