import React from 'react';
import Congrats from './Congrats';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsive from '../code-studio/responsiveRedux';

export default storybook => {
  const store = createStore(combineReducers({responsive}));
  return storybook
    .storiesOf('Congrats', module)
    .addStoryTable([
      {
        name: 'Congrats - Applab',
        description: `Congrats component if Applab tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="applab"
              isRtl={false}
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - pre-2017 Minecraft',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="pre2017Minecraft"
              isRtl={false}
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - 2017 Minecraft',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="2017Minecraft"
              isRtl={false}
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - other',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="other"
              isRtl={false}
            />
          </Provider>
        )
      },
    ]);
};
