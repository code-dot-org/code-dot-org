import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {throwOnConsoleWarnings} from '../../../util/testUtils';
import {
  UnconnectedOwnedSections as OwnedSections
} from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import Button from '@cdo/apps/templates/Button';
import RosterDialog from "@cdo/apps/templates/teacherDashboard/RosterDialog";
import AddSectionDialog from "@cdo/apps/templates/teacherDashboard/AddSectionDialog";
import EditSectionDialog from "@cdo/apps/templates/teacherDashboard/EditSectionDialog";
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';

const sections = {
  11: {
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
    hidden: false,
  },
  12: {
    id: 12,
    courseId: 29,
    scriptId: 168,
    name: "section_with_course_and_script",
    loginType: "google_classroom",
    grade: "3",
    providerManaged: true,
    stageExtras: false,
    pairingAllowed: true,
    studentCount: 0,
    code: "G-1234567",
    hidden: false,
  },
  13: {
    id: 13,
    name: 'foo',
    loginType: 'email',
    providerManaged: false,
    stageExtras: false,
    pairingAllowed: false,
    studentCount: 0,
    code: 'asdf',
    courseId: null,
    scriptId: 36,
    hidden: true,
  }
};

const defaultProps = {
  sectionIds: [11, 12, 13],
  sections: sections,
  asyncLoadComplete: true,
  beginEditingNewSection: () => {},
  beginEditingSection: () => {},
  beginImportRosterFlow: () => {},
};

describe('OwnedSections', () => {
  throwOnConsoleWarnings();

  it('renders SetUpSections when no sections have been created', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        sectionIds={[]}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <SetUpSections/>
        <RosterDialog/>
        <AddSectionDialog/>
        <EditSectionDialog/>
      </div>
    );
  });

  it('renders a SectionTable with no extra button if no hidden sections', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        sectionIds={[11,12]}
      />
    );
    expect(wrapper.find('SectionTable').length).to.equal(1);
    // No second button to view hidden
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('renders a SectionTable with view button if hidden sections', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
      />
    );
    expect(wrapper.find('SectionTable').length).to.equal(1);
    // Second button to view hidden
    expect(wrapper.find('Button').length).to.equal(2);
    expect(wrapper.find('Button').at(1).props().text, 'View hidden sections');
  });

  it('renders two SectionsTables if view hidden sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
      />
    );
    wrapper.find('Button').at(1).simulate('click');
    expect(wrapper.find('SectionTable').length).to.equal(2);
    expect(wrapper.find('SectionTable').at(0).props().sectionIds).to.deep.equal([11,12]);
    expect(wrapper.find('SectionTable').at(1).props().sectionIds).to.deep.equal([13]);
    expect(wrapper.find('Button').at(1).props().text).to.equal('Hide hidden sections');
  });

  it('renders just unhidden SectionsTable if hide sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
      />
    );
    wrapper.find('Button').at(1).simulate('click');
    wrapper.find('Button').at(1).simulate('click');
    expect(wrapper.find('SectionTable').length).to.equal(1);
    expect(wrapper.find('SectionTable').props().sectionIds).to.deep.equal([11,12]);
  });

  it('calls beginEditingNewSection with no arguments when button is clicked', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        beginEditingNewSection={spy}
      />
    );
    expect(spy).not.to.have.been.called;

    wrapper.find(Button).at(0).simulate('click', {fake: 'event'});
    expect(spy).to.have.been.calledOnce;
    expect(spy.firstCall.args).to.be.empty;
  });
});
