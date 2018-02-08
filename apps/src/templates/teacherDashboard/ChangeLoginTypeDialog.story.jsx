import React from 'react';
import ChangeLoginTypeDialog from "./ChangeLoginTypeDialog";
import {Provider} from 'react-redux';
import {action} from '@storybook/addon-actions';
import {combineReducers, createStore} from 'redux';
import teacherSections, {
  setSections,
  __testInterface__
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const {EDIT_SECTION_REQUEST} = __testInterface__;

const unModalForStorybook = {
  onLoginTypeChanged: () => {},
  hideBackdrop: true,
  style: {marginLeft: 0},
};

export default storybook => storybook
  .storiesOf('ChangeLoginTypeDialog', module)
  .addStoryTable([
    {
      name: 'Empty section',
      description: 'When a section is empty, the teacher gets lots of options for changing the login type.',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections(sections));
        return (
          <Provider store={store}>
            <ChangeLoginTypeDialog
              {...unModalForStorybook}
              handleClose={action('close')}
              sectionId={11}
            />
          </Provider>
        );
      }
    },
    {
      name: 'Empty section (saving)',
      description: 'When a section is empty, the teacher gets lots of options for changing the login type.',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections(sections));
        store.dispatch({type: EDIT_SECTION_REQUEST});
        return (
          <Provider store={store}>
            <ChangeLoginTypeDialog
              {...unModalForStorybook}
              handleClose={action('close')}
              sectionId={11}
            />
          </Provider>
        );
      }
    },
    {
      name: 'Picture section',
      description: 'When a picture section is not empty, it can only be changed to a word section.',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections(sections));
        return (
          <Provider store={store}>
            <ChangeLoginTypeDialog
              {...unModalForStorybook}
              handleClose={action('close')}
              sectionId={12}
            />
          </Provider>
        );
      }
    },
    {
      name: 'Picture section (saving)',
      description: 'When a picture section is not empty, it can only be changed to a word section.',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections(sections));
        store.dispatch({type: EDIT_SECTION_REQUEST});
        return (
          <Provider store={store}>
            <ChangeLoginTypeDialog
              {...unModalForStorybook}
              handleClose={action('close')}
              sectionId={12}
            />
          </Provider>
        );
      }
    },
    {
      name: 'Word section',
      description: 'When a word section is not empty, it can only be changed to a picture section.',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections(sections));
        return (
          <Provider store={store}>
            <ChangeLoginTypeDialog
              {...unModalForStorybook}
              handleClose={action('close')}
              sectionId={307}
            />
          </Provider>
        );
      }
    },
    {
      name: 'Word section (saving)',
      description: 'When a word section is not empty, it can only be changed to a picture section.',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections(sections));
        store.dispatch({type: EDIT_SECTION_REQUEST});
        return (
          <Provider store={store}>
            <ChangeLoginTypeDialog
              {...unModalForStorybook}
              handleClose={action('close')}
              sectionId={307}
            />
          </Provider>
        );
      }
    },
    {
      name: 'Email section',
      description: 'When an email section is not empty, it can only be changed to a picture or word section.',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections(sections));
        return (
          <Provider store={store}>
            <ChangeLoginTypeDialog
              {...unModalForStorybook}
              handleClose={action('close')}
              sectionId={14}
            />
          </Provider>
        );
      }
    },
    {
      name: 'Email section (saving)',
      description: 'When an email section is not empty, it can only be changed to a picture or word section.',
      story: () => {
        const store = createStore(combineReducers({teacherSections}));
        store.dispatch(setSections(sections));
        store.dispatch({type: EDIT_SECTION_REQUEST});
        return (
          <Provider store={store}>
            <ChangeLoginTypeDialog
              {...unModalForStorybook}
              handleClose={action('close')}
              sectionId={14}
            />
          </Provider>
        );
      }
    },
  ]);

function fakeSection(id, props = {}) {
  return {
    id,
    location: `/v2/sections/${id}`,
    name: 'Test section',
    login_type: 'picture',
    grade: 'K',
    code: 'BCDFGH',
    stage_extras: false,
    pairing_allowed: true,
    script: null,
    course_id: null,
    studentCount: 0,
    ...props,
  };
}

const sections = [
  fakeSection(11, {
    name: "Empty Section",
    studentCount: 0,
  }),
  fakeSection(12, {
    name: "Picture Section",
    login_type: "picture",
    studentCount: 1,
  }),
  fakeSection(307, {
    name: "Word Section",
    login_type: "word",
    studentCount: 10,
  }),
  fakeSection(14, {
    name: "Email section",
    login_type: "email",
    studentCount: 30,
  }),
];
