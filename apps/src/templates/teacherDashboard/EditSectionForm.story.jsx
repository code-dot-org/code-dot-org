import React from 'react';
import {UnconnectedEditSectionForm as EditSectionForm} from "./EditSectionForm";
import {action} from '@storybook/addon-actions';

const testSection = {
  id: 11,
  courseId: 29,
  scriptId: null,
  name: "my_section",
  loginType: "word",
  grade: "3",
  providerManaged: false,
  stageExtras: false,
  pairingAllowed: true,
  studentCount: 10,
  code: "PMTKVH",
};

const validAssignments = {
  '29_null': {
    id: 29,
      name: "CS Discoveries",
      script_name: "csd",
      category: "Full Courses",
      position: 1,
      category_priority: 0,
      courseId: 29,
      scriptId: null,
      assignId: "29_null",
      path: '//localhost-studio.code.org:3000/courses/csd',
  },
  'null_168': {
    id: 168,
      name: "Unit 1: Problem Solving",
      script_name: "csd1",
      category: "CS Discoveries",
      position: 0,
      category_priority: 7,
      courseId: null,
      scriptId: 168,
      assignId: "null_168",
      path: "//localhost-studio.code.org:3000/s/csd1"
  },
};

export default storybook => storybook
  .storiesOf('EditSectionForm', module)
  .add('Basic options', () => {
    return (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        primaryAssignmentIds={[]}
        sections={{}}
        section={testSection}
        isSaveInProgress={false}
        isCsfScript={() => false}
      />
    );
  })
  .add('While save is in progress', () => {
    return (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        primaryAssignmentIds={[]}
        sections={{}}
        section={testSection}
        isSaveInProgress={true}
        isCsfScript={() => false}
      />
    );
  });
