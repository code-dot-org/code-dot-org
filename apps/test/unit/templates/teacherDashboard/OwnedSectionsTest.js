import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {
  UnconnectedOwnedSections as OwnedSections
} from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import RosterDialog from "@cdo/apps/templates/teacherDashboard/RosterDialog";
import AddSectionDialog from "@cdo/apps/templates/teacherDashboard/AddSectionDialog";
import EditSectionDialog from "@cdo/apps/templates/teacherDashboard/EditSectionDialog";
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';
import Notification from '@cdo/apps/templates/Notification';

const defaultProps = {
  sectionIds: [11, 12, 13],
  hiddenSectionIds: [],
  asyncLoadComplete: true,
  beginEditingNewSection: () => {},
  beginEditingSection: () => {},
  beginImportRosterFlow: () => {},
};

describe('OwnedSections', () => {
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
      />
    );
    expect(wrapper.find('Connect(SectionTable)').length).to.equal(1);
    // No button to view hidden (notification button not counted)
    expect(wrapper.find('Button').length).to.equal(0);
  });

  it('renders a SectionTable with view button if hidden sections', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        hiddenSectionIds={[13]}
      />
    );
    expect(wrapper.find('Connect(SectionTable)').length).to.equal(1);
    // Button to view hidden (notification not counted)
    expect(wrapper.find('Button').length).to.equal(1);
    expect(wrapper.find('Button').at(0).props().text, 'View hidden sections');
  });

  it('renders two SectionsTables if view hidden sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        hiddenSectionIds={[13]}
      />
    );
    wrapper.find('Button').at(0).simulate('click');
    expect(wrapper.find('Connect(SectionTable)').length).to.equal(2);
    expect(wrapper.find('Connect(SectionTable)').at(0).props().sectionIds).to.deep.equal([11,12]);
    expect(wrapper.find('Connect(SectionTable)').at(1).props().sectionIds).to.deep.equal([13]);
    expect(wrapper.find('Button').at(0).props().text).to.equal('Hide hidden sections');
  });

  it('renders just unhidden SectionsTable if hide sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        hiddenSectionIds={[13]}
      />
    );
    wrapper.find('Button').at(1).simulate('click');
    wrapper.find('Button').at(1).simulate('click');
    expect(wrapper.find('Connect(SectionTable)').length).to.equal(1);
    expect(wrapper.find('Connect(SectionTable)').props().sectionIds).to.deep.equal([11,12]);
  });

  it('renders a Notification about adding a new section', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        sectionIds={[1,2,3]}
        beginEditingNewSection={spy}
      />
    );
    expect(spy).not.to.have.been.called;

    expect(wrapper.find(Notification).length).to.equal(1);
    expect(wrapper.find(Notification).props().notice).to.equal('Add a new classroom section');
  });
});
