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
        name: 'Congrats - Applab, signed out',
        description: `Congrats component if Applab tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="applab"
              isRtl={false}
              userType="signedOut"
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - Applab, student',
        description: `Congrats component if Applab tutorial completed, student`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="applab"
              isRtl={false}
              userType="student"
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - pre-2017 Minecraft, signed out',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="pre2017Minecraft"
              isRtl={false}
              userType="signedOut"
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - pre-2017 Minecraft, student',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="pre2017Minecraft"
              isRtl={false}
              userType="student"
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - 2017 Minecraft, signed out',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="2017Minecraft"
              isRtl={false}
              userType="signedOut"
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - 2017 Minecraft, student',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="2017Minecraft"
              isRtl={false}
              userType="student"
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - other, signed out',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="other"
              isRtl={false}
              userType="signedOut"
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - other, student',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="other"
              isRtl={false}
              userType="student"
            />
          </Provider>
        )
      },
      {
        name: 'Congrats - other, teacher',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
          <Provider store={store}>
            <Congrats
              completedTutorialType="other"
              isRtl={false}
              userType="teacher"
            />
          </Provider>
        )
      },
    ]);
};
