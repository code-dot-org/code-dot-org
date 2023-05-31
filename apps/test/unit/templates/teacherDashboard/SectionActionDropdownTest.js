import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedSectionActionDropdown as SectionActionDropdown} from '@cdo/apps/templates/teacherDashboard/SectionActionDropdown';
import {setRosterProvider} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import PrintCertificates from '@cdo/apps/templates/teacherDashboard/PrintCertificates';
import sinon from 'sinon';

const sections = [
  {
    id: 1,
    name: 'NoStudents',
    courseVersionName: 'cv',
    loginType: 'word',
    studentCount: 0,
    code: 'ABCD',
    grade: '10',
    providerManaged: false,
    hidden: false,
  },
  {
    id: 2,
    name: 'ThirdParty',
    courseVersionName: 'cv',
    loginType: 'google_classroom',
    studentCount: 0,
    code: 'EFGH',
    grade: '11',
    providerManaged: true,
    hidden: false,
  },
  {
    id: 3,
    name: 'HasStudents',
    courseVersionName: 'cv',
    loginType: 'picture',
    studentCount: 4,
    code: 'IJKL',
    grade: '9',
    providerManaged: false,
    hidden: false,
  },
  {
    id: 4,
    name: 'Hidden',
    courseVersionName: 'cv',
    loginType: 'email',
    studentCount: 2,
    code: 'MNOP',
    grade: '6',
    providerManaged: false,
    hidden: true,
  },
];

const DEFAULT_PROPS = {
  sectionData: sections[0],
  handleEdit: () => {},
  removeSection: () => {},
  toggleSectionHidden: () => {},
  updateRoster: () => {},
  setRosterProvider,
};

describe('SectionActionDropdown', () => {
  const onEditFunction = sinon.fake();

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
      <SectionActionDropdown
        {...DEFAULT_PROPS}
        sectionData={sections[1]}
        userId={-1}
      />
    );
    expect(wrapper).to.contain('View Progress');
    expect(wrapper).to.contain('Manage Students');
    expect(wrapper).to.not.contain('Print Login Cards');
    expect(wrapper).to.contain('Edit Section Details');
    expect(
      wrapper.find(<PrintCertificates sectionId={2} courseVersionName="cv" />)
        .length,
      1
    );
  });

  it('renders the five standard options for not a third party section', () => {
    const wrapper = shallow(
      <SectionActionDropdown
        {...DEFAULT_PROPS}
        sectionData={sections[0]}
        userId={-1}
      />
    );
    expect(wrapper).to.contain('View Progress');
    expect(wrapper).to.contain('Manage Students');
    expect(wrapper).to.contain('Print Login Cards');
    expect(wrapper).to.contain('Edit Section Details');
    expect(
      wrapper.find(<PrintCertificates sectionId={1} courseVersionName="cv" />)
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

  it('sends selected user to the new edit page', () => {
    const wrapper = shallow(
      <SectionActionDropdown
        {...DEFAULT_PROPS}
        sectionData={sections[3]}
        userId={90}
      />
    );
    const sectionId = wrapper.instance().props.sectionData.id;
    const expectedUrl = '/sections/' + sectionId + '/edit';
    expect(wrapper).to.contain('Edit Section Details');
    expect(wrapper.find('.edit-section-details-link').props().href).to.equal(
      expectedUrl
    );
  });

  // this test can be deleted once we fully switch over to the new flow
  it('sends user to the old edit page', () => {
    const wrapper = shallow(
      <SectionActionDropdown
        {...DEFAULT_PROPS}
        sectionData={sections[3]}
        userId={-1}
        handleEdit={onEditFunction}
      />
    );
    expect(wrapper).to.contain('Edit Section Details');
    wrapper.find('.edit-section-details-link').simulate('click');
    expect(onEditFunction).to.have.been.calledOnce;
  });
});
