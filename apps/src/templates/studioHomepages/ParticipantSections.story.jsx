import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import ParticipantSections from './ParticipantSections';

const sections = [
  {
    name: 'Algebra Period 1',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'CS in Algebra',
    linkToAssigned: 'to Course',
    numberOfStudents: 14,
    linkToStudents: 'to Manage Students tab',
    code: 'ABCDEF',
  },
  {
    name: 'Algebra Period 2',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'CS in Algebra',
    linkToAssigned: 'to Course',
    numberOfStudents: 19,
    linkToStudents: 'to Manage Students tab',
    code: 'EEB206',
  },
  {
    name: 'Period 3',
    teacherName: 'Ms. Frizzle',
    linkToProgress: 'to Progress tab',
    assignedTitle: 'Course 4',
    linkToAssigned: 'to Course',
    numberOfStudents: 22,
    linkToStudents: 'to Manage Students tab',
    code: 'HPRWHG',
  },
];

export default {
  component: ParticipantSections,
};

const Template = args => {
  return (
    <Provider store={reduxStore()}>
      <ParticipantSections
        updateSectionsResult={action('update sections result')}
        updateSections={action('update sections')}
        {...args}
      />
    </Provider>
  );
};

export const StudentNoSectionsExample = Template.bind({});
StudentNoSectionsExample.args = {
  sections: [],
};

export const StudentEnrolledInSectionsExample = Template.bind({});
StudentEnrolledInSectionsExample.args = {
  sections: sections,
};

export const TeacherEnrolledAsStudentsWithPermissionExample = Template.bind({});
TeacherEnrolledAsStudentsWithPermissionExample.args = {
  sections: sections,
  isTeacher: true,
};

export const PLTeacherEnrolledAsStudentsWithPermissionExample = Template.bind(
  {}
);
PLTeacherEnrolledAsStudentsWithPermissionExample.args = {
  sections: sections,
  isTeacher: true,
  isPlSections: true,
};
