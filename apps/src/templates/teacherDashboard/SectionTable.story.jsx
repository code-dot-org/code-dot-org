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

export default storybook => {
  storybook
    .storiesOf('SectionTable (teacher dashboard)', module)
    .addStoryTable([
      {
        name: 'section table',
        story: () => (
          <SectionTable sections={sections}/>
        )
      }
    ]);
};
