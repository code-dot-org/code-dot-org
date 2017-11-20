import React from 'react';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import Responsive from '../responsive';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsiveRedux from '../code-studio/responsiveRedux';

export default storybook => {
  const responsive = new Responsive();
  const store = createStore(combineReducers({responsive: responsiveRedux}));
  return storybook
    .storiesOf('StudentsBeyondHoc', module)
    .addStoryTable([
      {
        name: 'Other tutorial, English, teacher',
        description: `StudentsBeyondHoc`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="other"
              responsive={responsive}
              isRtl={false}
              userType="teacher"
              isEnglish={true}
            />
          </Provider>
        )
      },
      {
        name: 'Other tutorial, English, student over 13',
        description: `StudentsBeyondHoc`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="other"
              responsive={responsive}
              isRtl={false}
              userType="student"
              userAge={14}
              isEnglish={true}
            />
          </Provider>
        )
      },
      {
        name: 'Other tutorial, English, student under 13',
        description: `StudentsBeyondHoc`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="other"
              responsive={responsive}
              isRtl={false}
              userType="student"
              userAge={10}
              isEnglish={true}
            />
          </Provider>
        )
      },
      {
        name: 'Other tutorial, English, signed out',
        description: `StudentsBeyondHoc`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="other"
              responsive={responsive}
              isRtl={false}
              userType="signedOut"
              isEnglish={true}
            />
          </Provider>
        )
      },
      {
        name: 'Other tutorial, non-English, signed out',
        description: `StudentsBeyondHoc`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="other"
              responsive={responsive}
              isRtl={false}
              userType="signedOut"
              isEnglish={false}
            />
          </Provider>
        )
      },
      {
        name: 'Applab, signed out, English',
        description: `Same for non-English`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="applab"
              responsive={responsive}
              isRtl={false}
              userType="signedOut"
              isEnglish={true}
            />
          </Provider>
        )
      },
      {
        name: 'Applab, signed in, English',
        description: `Same for non-English`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="applab"
              responsive={responsive}
              isRtl={false}
              userType="student"
              isEnglish={true}
            />
          </Provider>
        )
      },
      {
        name: 'pre2017 Minecraft, signed in, English, under 13',
        description: `pre2017 Minecraft, signed in, English, under 13`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="pre2017Minecraft"
              responsive={responsive}
              isRtl={false}
              userType="student"
              isEnglish={true}
              userAge={8}
            />
          </Provider>
        )
      },
      {
        name: 'pre2017 Minecraft, signed in, English, 13+',
        description: `pre2017 Minecraft, signed in, English, 13+`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="pre2017Minecraft"
              responsive={responsive}
              isRtl={false}
              userType="student"
              isEnglish={true}
              userAge={16}
            />
          </Provider>
        )
      },
      {
        name: 'pre2017 Minecraft, signed in, non-English',
        description: `Same for signed out`,
        story: () => (
          <Provider store={store}>
            <StudentsBeyondHoc
              completedTutorialType="pre2017Minecraft"
              responsive={responsive}
              isRtl={false}
              userType="student"
              isEnglish={false}
            />
          </Provider>
        )
      },
    ]);
};
