import React from 'react';
import {Provider} from 'react-redux';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import teacherSections, {setSections, serverSectionFromSection} from '../teacherDashboard/teacherSectionsRedux';
import oauthClassroom from '../teacherDashboard/oauthClassroomRedux';
import Sections from './Sections';

const sections = [
  {
    name: "Algebra Period 1",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 14,
    linkToStudents: "to Manage Students tab",
    code: "ABCDEF"
  },
  {
    name: "Algebra Period 2",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 19,
    linkToStudents: "to Manage Students tab",
    code: "EEB206"
  },
  {
    name: "Period 3",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "Course 4",
    linkToAssigned: "to Course",
    numberOfStudents: 22,
    linkToStudents: "to Manage Students tab",
    code: "HPRWHG"
  },
];
const serverSections = sections.map(serverSectionFromSection);

export default [
  {
    name: 'Sections - teacher at least one section',
    description: 'shows a table of sections on the teacher homepage',
    story: () => {
      registerReducers({teacherSections, oauthClassroom});
      const store = createStoreWithReducers();
      store.dispatch(setSections(serverSections));
      return (
        <Provider store={store}>
          <Sections
            sections={sections}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={true}
            canLeave={false}
          />
        </Provider>
      );
    }
  },
  {
    name: 'Sections - teacher, no sections yet',
    description: 'shows a set up message if the teacher does not have any sections yet',
    story: () => {
      registerReducers({teacherSections, oauthClassroom});
      const store = createStoreWithReducers();
      return (
        <Provider store={store}>
          <Sections
            sections={[]}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={true}
            canLeave={false}
          />
        </Provider>
      );
    }
  },
  {
    name: 'Sections - student, no sections yet',
    description: 'shows a join sections component with attention-grabbing dashed border',
    story: () => {
      registerReducers({teacherSections, oauthClassroom});
      return (
        <Provider store={createStoreWithReducers()}>
          <Sections
            sections={[]}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={false}
            canLeave={false}
          />
        </Provider>
      );
    }
  },
  {
    name: 'Sections - student, enrolled in sections but does NOT have permission to leave the sections',
    description: 'shows a sections table, no column for leave buttons, and a solid border join section component',
    story: () => {
      registerReducers({teacherSections, oauthClassroom});
      const store = createStoreWithReducers();
      store.dispatch(setSections(serverSections));
      return (
        <Provider store={store}>
          <Sections
            sections={sections}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={false}
            canLeave={false}
          />
        </Provider>
      );
    }
  },
  {
    name: 'Sections - student, enrolled in sections and does have permission to leave the sections',
    description: 'shows a sections table, including a column for leave buttons, and a solid border join section component',
    story: () => {
      registerReducers({teacherSections, oauthClassroom});
      const store = createStoreWithReducers();
      store.dispatch(setSections(serverSections));
      return (
        <Provider store={store}>
          <Sections
            sections={sections}
            codeOrgUrlPrefix = "http://code.org/"
            isRtl={false}
            isTeacher={false}
            canLeave={true}
          />
        </Provider>
      );
    }
  },
];
