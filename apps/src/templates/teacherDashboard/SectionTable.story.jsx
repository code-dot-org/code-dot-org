import React from 'react';
import SectionTable from './SectionTable';

const sections = [
  {
    id: 11,
    name: "brent_section",
    loginType: "word",
    grade: null,
    stageExtras: false,
    pairingAllowed: true,
    numStudents: 10,
    code: "PMTKVH",
    assignmentName: "CS Discoveries",
    assignmentPath: "//localhost-studio.code.org:3000/courses/csd"
  },
  {
    id: 12,
    name: "section2",
    loginType: "picture",
    grade: "11",
    stageExtras: false,
    pairingAllowed: true,
    numStudents: 1,
    code: "DWGMFX",
    assignmentName: "Course 3",
    assignmentPath: "//localhost-studio.code.org:3000/s/course3"
  },
  {
    id: 307,
    name: "plc",
    loginType: "email",
    grade: "10",
    stageExtras: false,
    pairingAllowed: true,
    numStudents: 0,
    code: "WGYXTR",
    assignmentName: "Infinity Play Lab",
    assignmentPath: "//localhost-studio.code.org:3000/s/infinity"
  }
];

const validCourses = [
  {
    id: 29,
    name: "CS Discoveries",
    script_name: "csd",
    category: "Full Courses",
    position: 1,
    category_priority: -1,
  },
  {
    id: 30,
    name: "CS Principles",
    script_name: "csp",
    category: "Full Courses",
    position: 0,
    category_priority: -1,
  }];

  const validScripts = [
  {
    id: 1,
    name: "Accelerated Course",
    script_name: "20-hour",
    category: "CS Fundamentals",
    position: 0,
    category_priority: 0,
  },
  {
    id: 2,
    name: "Hour of Code *",
    script_name: "Hour of Code",
    category: "Hour of Code",
    position: 1,
    category_priority: 0,
  },
  {
    id: 3,
    name: "edit-code *",
    script_name: "edit-code",
    category: "other",
    position: null,
    category_priority: 3,
  },
  {
    id: 4,
    name: "events *",
    script_name: "events",
    category: "other",
    position: null,
    category_priority: 3,
  }
];

export default storybook => {
  storybook
    .storiesOf('SectionTable (teacher dashboard)', module)
    .addStoryTable([
      {
        name: 'section table',
        story: () => (
          <SectionTable
            validLoginTypes={['word', 'email', 'picture']}
            validGrades={["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Other"]}
            validCourses={validCourses}
            validScripts={validScripts}
            sections={sections}
          />
        )
      }
    ]);
};
