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
          fakeSection(1, {
            name: 'Test section',
            login_type: 'picture',
            studentCount: 3,
          })
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
          fakeSection(2, {
            name: 'Test section',
            login_type: 'word',
            studentCount: 3,
          })
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
          fakeSection(3, {
            name: 'Test section',
            login_type: 'email',
            studentCount: 3,
          })
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
          fakeSection(4, {
            name: 'Test section',
            login_type: 'picture',
            studentCount: 0,
          })
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
          fakeSection(1111, {
            name: 'Test section',
            login_type: 'clever',
            studentCount: 3,
          })
        ]));
        return (
          <Provider store={store}>
            <LoginTypeParagraph sectionId={1111}/>
          </Provider>
        );
      }
    },
  ]);

function fakeSection(id, props = {}) {
  return {
    id,
    name: 'Test section',
    code: 'YYYYYY',
    stage_extras: false,
    pairing_allowed: true,
    ...props,
  };
}
