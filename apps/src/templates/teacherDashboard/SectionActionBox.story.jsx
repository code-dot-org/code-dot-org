import React from 'react';
import SectionActionBox from './SectionActionBox';

const sectionDataHidden = {
    id: "1",
    name: 'NAME',
    loginType: "email",
    studentCount: 0,
    code: "RGRBJT",
    grade: "12",
    providerManaged: false,
    hidden: true,
    assignmentNames: ["Course A"],
    assignmentPath: ["/s/coursea"],
};

const sectionDataShown = {
    id: "1",
    name: 'NAME',
    loginType: "email",
    studentCount: 0,
    code: "RGRBJT",
    grade: "12",
    providerManaged: false,
    hidden: false,
    assignmentNames: ["Course A"],
    assignmentPath: ["/s/coursea"],
};

const sectionDataNotEmpty = {
    id: "1",
    name: 'NAME',
    loginType: "email",
    studentCount: 3,
    code: "RGRBJT",
    grade: "12",
    providerManaged: false,
    hidden: false,
    assignmentNames: ["Course A"],
    assignmentPath: ["/s/coursea"],
};

export default storybook => {
    storybook
        .storiesOf('SectionActionBox', module)
        .addStoryTable([
            {
                name: 'Hidden Section',
                description: 'Should have "Show Section" option',
                story: () => (
                    <SectionActionBox
                      sectionData = {sectionDataHidden}
                    />
                )
            },
            {
                name: 'Shown Section',
                description: 'Should have "Show Section" option',
                story: () => (
                    <SectionActionBox
                      sectionData = {sectionDataShown}
                    />
                )
            },
            {
                name: 'Not-Empty Class',
                description: 'studentCount > 0, show "Archive Section" option',
                story: () => (
                    <SectionActionBox
                      sectionData = {sectionDataNotEmpty}
                    />
                )
            },
        ]);
};
