import React from 'react';
import _ from 'lodash';
import ChangeLoginTypeDialog from "./ChangeLoginTypeDialog";
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import teacherSections, { setSections } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const unModalForStorybook = {
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
              handleClose={storybook.action('close')}
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
              handleClose={storybook.action('close')}
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
              handleClose={storybook.action('close')}
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
              handleClose={storybook.action('close')}
              sectionId={14}
            />
          </Provider>
        );
      }
    },
  ]);

const fakeStudents = num => _.range(num).map(x => ({id: x}));
const sections = [
  {
    id: 11,
    location: "/v2/sections/11",
    name: "Empty Section",
    login_type: "picture",
    grade: "2",
    code: "PMTKVH",
    stage_extras: false,
    pairing_allowed: true,
    script: null,
    course_id: 29,
    students: []
  },
  {
    id: 12,
    location: "/v2/sections/12",
    name: "Picture Section",
    login_type: "picture",
    grade: "11",
    code: "DWGMFX",
    stage_extras: false,
    pairing_allowed: true,
    script: {
      id: 36,
      name: 'course3'
    },
    course_id: null,
    students: fakeStudents(1)
  },
  {
    id: 307,
    location: "/v2/sections/307",
    name: "Word Section",
    login_type: "word",
    grade: "10",
    code: "WGYXTR",
    stage_extras: true,
    pairing_allowed: false,
    script: {
      id: 46,
      name: 'infinity'
    },
    course_id: null,
    students: fakeStudents(10)
  },
  {
    id: 14,
    location: "/v2/sections/14",
    name: "Email section",
    login_type: "email",
    grade: "10",
    code: "WGYXTR",
    stage_extras: true,
    pairing_allowed: false,
    script: {
      id: 46,
      name: 'infinity'
    },
    course_id: null,
    students: fakeStudents(30)
  }
];
