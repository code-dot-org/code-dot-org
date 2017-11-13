import React from 'react';
import Congrats from './Congrats';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsive from '../code-studio/responsiveRedux';
import isRtl from '../code-studio/isRtlRedux';

export default storybook => {
  const store = createStore(combineReducers({responsive, isRtl}));
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
              userType="signedOut"
              isEnglish={true}
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
              userType="student"
              isEnglish={true}
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
              userType="signedOut"
              isEnglish={true}
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
              userType="student"
              isEnglish={true}
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
              userType="signedOut"
              isEnglish={true}
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
              MCShareLink="code.org/minecraft"
              userType="student"
              isEnglish={true}
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
              userType="signedOut"
              isEnglish={true}
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
              userType="student"
              isEnglish={true}
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
              userType="teacher"
              isEnglish={true}
            />
          </Provider>
        )
      },
    ]);
};
