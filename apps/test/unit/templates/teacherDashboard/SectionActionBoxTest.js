import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedSectionActionBox as SectionActionBox} from '@cdo/apps/templates/teacherDashboard/SectionActionBox';
import PrintCertificates from '@cdo/apps/templates/teacherDashboard/PrintCertificates';

const sections = [
  {
    id: 1,
    name: "NoStudents",
    loginType: 'word',
    studentCount: 0,
    code: "ABCD",
    grade: "10",
    providerManaged: false,
    assignmentNames: ["a"],
    assignmentPaths: ["b"],
    hidden: false,
  },
  {
    id: 2,
    name: "ThirdParty",
    loginType: 'google_classroom',
    studentCount: 0,
    code: "EFGH",
    grade: "11",
    providerManaged: true,
    assignmentNames: ["a"],
    assignmentPaths: ["b"],
    hidden: false,
  },
  {
    id: 3,
    name: "HasStudents",
    loginType: 'picture',
    studentCount: 4,
    code: "IJKL",
    grade: "9",
    providerManaged: false,
    assignmentNames: ["a"],
    assignmentPaths: ["b"],
    hidden: false,
  },
  {
    id: 4,
    name: "Hidden",
    loginType: 'email',
    studentCount: 2,
    code: "MNOP",
    grade: "6",
    providerManaged: false,
    assignmentNames: ["a"],
    assignmentPaths: ["b"],
    hidden: true,
  }
];

describe('SectionActionBox', () => {
  it('renders the delete option when a section is not a third party and has zero students', () => {
    const wrapper = shallow(
        <SectionActionBox
          sectionData={sections[0]}
          onEdit={() => {}}
          removeSection={() => {}}
          toggleSectionHidden={() => {}}
          updateRoster={() => {}}
        />
    );
    expect(wrapper).to.contain("Delete Section");
  });

  it('renders the delete option when a section is a third party (Google Classroom) and has zero students', () => {
    const wrapper = shallow(
      <SectionActionBox
        sectionData={sections[1]}
        onEdit={() => {}}
        removeSection={() => {}}
        toggleSectionHidden={() => {}}
        updateRoster={() => {}}
      />
    );
    expect(wrapper).to.contain("Delete Section");
  });

  it('does not render the delete option for sections with students', () => {
    const wrapper = shallow(
      <SectionActionBox
        sectionData={sections[2]}
        onEdit={() => {}}
        removeSection={() => {}}
        toggleSectionHidden={() => {}}
        updateRoster={() => {}}
      />
    );
    expect(wrapper).to.not.contain("Delete Section");
  });

  it('renders the sync option for third party (Google Classroom) sections', () => {
    const wrapper = shallow(
      <SectionActionBox
        sectionData={sections[1]}
        onEdit={() => {}}
        removeSection={() => {}}
        toggleSectionHidden={() => {}}
        updateRoster={() => {}}
      />
    );
    expect(wrapper).to.contain("Sync students from Google Classroom");
  });

  it('renders the five standard options for a third party section (Google Classroom)', () => {
    const wrapper = shallow(
      <SectionActionBox
        sectionData={sections[1]}
        onEdit={() => {}}
        removeSection={() => {}}
        toggleSectionHidden={() => {}}
        updateRoster={() => {}}
      />
    );
    expect(wrapper).to.contain("View Progress");
    expect(wrapper).to.contain('Manage Students');
    expect(wrapper).to.contain('Print Login Cards');
    expect(wrapper).to.contain('Edit Section Details');
    expect(wrapper).to.contain(<PrintCertificates sectionId={2} assignmentName="a"/>);
  });

  it('renders the five standard options for not a third party section', () => {
    const wrapper = shallow(
      <SectionActionBox
        sectionData={sections[0]}
        onEdit={() => {}}
        removeSection={() => {}}
        toggleSectionHidden={() => {}}
        updateRoster={() => {}}
      />
    );
    expect(wrapper).to.contain("View Progress");
    expect(wrapper).to.contain('Manage Students');
    expect(wrapper).to.contain('Print Login Cards');
    expect(wrapper).to.contain('Edit Section Details');
    expect(wrapper).to.contain(<PrintCertificates sectionId={1} assignmentName="a"/>);
  });

  it('renders the hide option for a un-hidden section', () => {
    const wrapper = shallow(
      <SectionActionBox
        sectionData={sections[0]}
        onEdit={() => {}}
        removeSection={() => {}}
        toggleSectionHidden={() => {}}
        updateRoster={() => {}}
      />
    );
    expect(wrapper).to.contain("Hide Section");
  });

  it('renders the show option for a hidden section', () => {
    const wrapper = shallow(
      <SectionActionBox
        sectionData={sections[3]}
        onEdit={() => {}}
        removeSection={() => {}}
        toggleSectionHidden={() => {}}
        updateRoster={() => {}}
      />
    );
    expect(wrapper).to.contain("Show Section");
  });
});
