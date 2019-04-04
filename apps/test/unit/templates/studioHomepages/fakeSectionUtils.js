import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

export const sections = [
  {
    id: 11,
    name: 'Period 1',
    teacherName: 'Ms. Frizzle',
    linkToProgress:
      'https://code.org/teacher-dashboard#/sections/111111/progress',
    assignedTitle: 'Course 1',
    linkToAssigned: 'https://studio.code.org/s/course1',
    numberOfStudents: 1,
    linkToStudents:
      'https://code.org/teacher-dashboard#/sections/111111/manage',
    code: 'ABCDEF',
    loginType: 'picture',
    stageExtras: false,
    pairingAllowed: true,
    courseId: null,
    scriptId: null
  },
  {
    id: 12,
    name: 'Period 2',
    teacherName: 'Ms. Frizzle',
    linkToProgress:
      'https://code.org/teacher-dashboard#/sections/222222/progress',
    assignedTitle: 'Course 2',
    linkToAssigned: 'https://studio.code.org/s/course2',
    numberOfStudents: 2,
    linkToStudents:
      'https://code.org/teacher-dashboard#/sections/222222/manage',
    code: 'EEBSKR',
    loginType: 'picture',
    stageExtras: false,
    pairingAllowed: true,
    courseId: null,
    scriptId: null
  }
];

export const serverSections = sections.map(serverSectionFromSection);
