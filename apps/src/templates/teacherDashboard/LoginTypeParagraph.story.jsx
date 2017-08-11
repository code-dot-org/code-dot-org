import React from 'react';
import LoginTypeParagraph from './LoginTypeParagraph';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import teacherSections, { setSections } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

export default storybook => storybook
  .storiesOf('LoginTypeParagraph', module)
  .addStoryTable([
    {
      name: 'picture',
      description: '',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph
              loginType="picture"
            />
          </Provider>
        );
      }
    },
    {
      name: 'word',
      description: '',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph
              loginType="word"
            />
          </Provider>
        );
      }
    },
    {
      name: 'email',
      description: '',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph
              loginType="email"
            />
          </Provider>
        );
      }
    },
    {
      name: 'other',
      description: 'Intentionally renders nothing',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph
              loginType="other"
            />
          </Provider>
        );
      }
    },
  ]);
