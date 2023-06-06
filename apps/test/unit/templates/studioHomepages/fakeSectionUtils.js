import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

export const progressUrl =
  'https://studio.code.org/teacher_dashboard/sections/111111/progress';

export const manageStudentsUrl =
  'https://studio.code.org/teacher_dashboard/sections/111111/manage_students';

export const sections = [
  {
    id: 11,
    name: 'Period 1',
    teacherName: 'Ms. Frizzle',
    linkToProgress: progressUrl,
    assignedTitle: 'Course 1',
    linkToAssigned: 'https://studio.code.org/s/course1',
    numberOfStudents: 1,
    linkToStudents: manageStudentsUrl,
    code: 'ABCDEF',
    loginType: 'picture',
    lessonExtras: false,
    pairingAllowed: true,
    courseId: null,
    courseOfferingId: null,
    courseVersionId: null,
    unitId: null,
    isAssigned: true,
    participant_type: 'student',
  },
  {
    id: 12,
    name: 'Period 2',
    teacherName: 'Ms. Frizzle',
    linkToProgress: progressUrl,
    assignedTitle: 'Course 2',
    linkToAssigned: 'https://studio.code.org/s/course2',
    numberOfStudents: 2,
    linkToStudents: manageStudentsUrl,
    code: 'EEBSKR',
    loginType: 'picture',
    lessonExtras: false,
    pairingAllowed: true,
    courseId: null,
    courseOfferingId: null,
    courseVersionId: null,
    unitId: null,
    isAssigned: false,
    participant_type: 'student',
  },
];

export const serverSections = sections.map(serverSectionFromSection);
