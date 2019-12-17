import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedSectionActionDropdown as SectionActionDropdown} from '@cdo/apps/templates/teacherDashboard/SectionActionDropdown';
import {setRosterProvider} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import PrintCertificates from '@cdo/apps/templates/teacherDashboard/PrintCertificates';

const sections = [
  {
    id: 1,
    name: 'NoStudents',
    loginType: 'word',
    studentCount: 0,
    code: 'ABCD',
    grade: '10',
    providerManaged: false,
    assignmentNames: ['a'],
    assignmentPaths: ['b'],
    hidden: false
  },
  {
    id: 2,
    name: 'ThirdParty',
    loginType: 'google_classroom',
    studentCount: 0,
    code: 'EFGH',
    grade: '11',
    providerManaged: true,
    assignmentNames: ['a'],
    assignmentPaths: ['b'],
    hidden: false
  },
  {
    id: 3,
    name: 'HasStudents',
    loginType: 'picture',
    studentCount: 4,
    code: 'IJKL',
    grade: '9',
    providerManaged: false,
    assignmentNames: ['a'],
    assignmentPaths: ['b'],
    hidden: false
  },
  {
    id: 4,
    name: 'Hidden',
    loginType: 'email',
    studentCount: 2,
    code: 'MNOP',
    grade: '6',
    providerManaged: false,
    assignmentNames: ['a'],
    assignmentPaths: ['b'],
    hidden: true
  }
];

const DEFAULT_PROPS = {
  sectionData: sections[0],
  onEdit: () => {},
  removeSection: () => {},
  toggleSectionHidden: () => {},
  updateRoster: () => {},
  setRosterProvider
};

describe('SectionActionDropdown', () => {
  it('renders the delete option when a section is not a third party and has zero students', () => {
    const wrapper = shallow(
      <SectionActionDropdown {...DEFAULT_PROPS} sectionData={sections[0]} />
    );
    expect(wrapper).to.contain('Delete Section');
  });

  it('renders the delete option when a section is a third party (Google Classroom) and has zero students', () => {
    const wrapper = shallow(
      <SectionActionDropdown {...DEFAULT_PROPS} sectionData={sections[1]} />
    );
    expect(wrapper).to.contain('Delete Section');
  });

  it('does not render the delete option for sections with students', () => {
    const wrapper = shallow(
      <SectionActionDropdown {...DEFAULT_PROPS} sectionData={sections[3]} />
    );
    expect(wrapper.text()).to.not.include('Delete Section');
  });

  it('renders the sync option for third party (Google Classroom) sections', () => {
    const wrapper = shallow(
      <SectionActionDropdown {...DEFAULT_PROPS} sectionData={sections[1]} />
    );
    expect(wrapper).to.contain('Sync students from Google Classroom');
  });

  it('renders the four standard options for a third party section (Google Classroom)', () => {
    const wrapper = shallow(
      <SectionActionDropdown {...DEFAULT_PROPS} sectionData={sections[1]} />
    );
    expect(wrapper).to.contain('View Progress');
    expect(wrapper).to.contain('Manage Students');
    expect(wrapper).to.not.contain('Print Login Cards');
    expect(wrapper).to.contain('Edit Section Details');
    expect(
      wrapper.find(<PrintCertificates sectionId={2} assignmentName="a" />)
        .length,
      1
    );
  });

  it('renders the five standard options for not a third party section', () => {
    const wrapper = shallow(
      <SectionActionDropdown {...DEFAULT_PROPS} sectionData={sections[0]} />
    );
    expect(wrapper).to.contain('View Progress');
    expect(wrapper).to.contain('Manage Students');
    expect(wrapper).to.contain('Print Login Cards');
    expect(wrapper).to.contain('Edit Section Details');
    expect(
      wrapper.find(<PrintCertificates sectionId={1} assignmentName="a" />)
        .length,
      1
    );
  });

  it('renders the archive option for an unarchived section', () => {
    const wrapper = shallow(
      <SectionActionDropdown {...DEFAULT_PROPS} sectionData={sections[0]} />
    );
    expect(wrapper).to.contain('Archive Section');
  });

  it('renders the restore option for an archived section', () => {
    const wrapper = shallow(
      <SectionActionDropdown {...DEFAULT_PROPS} sectionData={sections[3]} />
    );
    expect(wrapper).to.contain('Restore Section');
  });
});
