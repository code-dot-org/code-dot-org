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
      description: 'Can change to word',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([
          {
            id: 1,
            login_type: 'picture',
            studentCount: 3,
          }
        ]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph sectionId={1}/>
          </Provider>
        );
      }
    },
    {
      name: 'word',
      description: 'Can change to picture',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([
          {
            id: 2,
            login_type: 'word',
            studentCount: 3,
          }
        ]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph sectionId={2}/>
          </Provider>
        );
      }
    },
    {
      name: 'email',
      description: 'Can change to word or picture',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([
          {
            id: 3,
            login_type: 'email',
            studentCount: 3,
          }
        ]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph sectionId={3}/>
          </Provider>
        );
      }
    },
    {
      name: 'empty section',
      description: 'button says "Change login type"',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([
          {
            id: 4,
            login_type: 'picture',
            studentCount: 0,
          }
        ]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph sectionId={4}/>
          </Provider>
        );
      }
    },
    {
      name: 'other',
      description: 'Intentionally renders nothing',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections([
          {
            id: 1111,
            login_type: 'other',
            studentCount: 3,
          }
        ]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph sectionId={1111}/>
          </Provider>
        );
      }
    },
  ]);
