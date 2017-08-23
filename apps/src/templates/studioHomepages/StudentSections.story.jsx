import React from 'react';
import StudentSections from './StudentSections';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

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

export default storybook => storybook
  .storiesOf('StudentSections', module)
  .addStoryTable([
    {
      name: 'Sections - student, no sections yet',
      description: 'shows a join sections component with attention-grabbing dashed border',
      story: () => (
        <Provider store={store}>
          <StudentSections
            initialSections={[]}
            isRtl={false}
            canLeave={false}
          />
        </Provider>
      )
    },
    {
      name: 'Sections - student, enrolled in sections but does NOT have permission to leave the sections',
      description: 'shows a sections table, no column for leave buttons, and a solid border join section component',
      story: () => (
        <Provider store={store}>
          <StudentSections
            initialSections={sections}
            isRtl={false}
            canLeave={false}
          />
        </Provider>
      )
    },
    {
      name: 'Sections - student, enrolled in sections and does have permission to leave the sections',
      description: 'shows a sections table, including a column for leave buttons, and a solid border join section component',
      story: () => (
        <Provider store={store}>
          <StudentSections
            initialSections={sections}
            isRtl={false}
            canLeave={true}
          />
        </Provider>
      )
    },
  ]);
