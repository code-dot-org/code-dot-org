export const testSection = {
  id: 11,
  courseId: 29,
  scriptId: null,
  name: 'my_section',
  loginType: 'word',
  grade: '3',
  providerManaged: false,
  stageExtras: false,
  ttsAutoplayEnabled: false,
  pairingAllowed: true,
  studentCount: 10,
  code: 'PMTKVH'
};

export const noStudentsSection = {
  id: 11,
  courseId: 29,
  scriptId: null,
  name: 'my_section',
  loginType: 'word',
  grade: '3',
  providerManaged: false,
  stageExtras: false,
  ttsAutoplayEnabled: false,
  pairingAllowed: true,
  studentCount: 0,
  code: 'PMTKVH'
};

export const validAssignments = {
  '29_null': {
    id: 29,
    name: 'CS Discoveries 2017',
    script_name: 'csd',
    category: 'Full Courses',
    position: 1,
    category_priority: 0,
    courseId: 29,
    scriptId: null,
    assignId: '29_null',
    path: '//localhost-studio.code.org:3000/courses/csd',
    assignment_family_name: 'csd',
    assignment_family_title: 'CS Discoveries',
    version_year: '2017',
    version_title: "'17-'18"
  },
  null_168: {
    id: 168,
    name: 'Unit 1: Problem Solving',
    script_name: 'csd1',
    category: 'CS Discoveries',
    position: 0,
    category_priority: 7,
    courseId: null,
    scriptId: 168,
    assignId: 'null_168',
    path: '//localhost-studio.code.org:3000/s/csd1-2019',
    assignment_family_name: 'csd1',
    assignment_family_title: 'Unit 1: Problem Solving',
    version_year: '2017',
    version_title: '2017'
  }
};

export const assignmentFamilies = [
  {
    name: 'CS Discoveries 2017',
    category: 'Full Courses',
    position: 1,
    category_priority: 0,
    assignment_family_name: 'csd',
    assignment_family_title: 'CS Discoveries'
  },
  {
    name: 'Unit 1: Problem Solving',
    category: 'CS Discoveries',
    position: 0,
    category_priority: 7,
    assignment_family_name: 'csd1',
    assignment_family_title: 'Unit 1: Problem Solving'
  }
];
