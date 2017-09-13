import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {
  UnconnectedOwnedSections as OwnedSections
} from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import Button from '@cdo/apps/templates/Button';
import RosterDialog from "@cdo/apps/templates/teacherDashboard/RosterDialog";
import AddSectionDialog from "@cdo/apps/templates/teacherDashboard/AddSectionDialog";
import EditSectionDialog from "@cdo/apps/templates/teacherDashboard/EditSectionDialog";
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';

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
    // No second button to view hidden
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('renders a SectionTable with view button if hidden sections', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        hiddenSectionIds={[13]}
      />
    );
    expect(wrapper.find('Connect(SectionTable)').length).to.equal(1);
    // Second button to view hidden
    expect(wrapper.find('Button').length).to.equal(2);
    expect(wrapper.find('Button').at(1).props().text, 'View hidden sections');
  });

  it('renders two SectionsTables if view hidden sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        hiddenSectionIds={[13]}
      />
    );
    wrapper.find('Button').at(1).simulate('click');
    expect(wrapper.find('Connect(SectionTable)').length).to.equal(2);
    expect(wrapper.find('Connect(SectionTable)').at(0).props().sectionIds).to.deep.equal([11,12]);
    expect(wrapper.find('Connect(SectionTable)').at(1).props().sectionIds).to.deep.equal([13]);
    expect(wrapper.find('Button').at(1).props().text).to.equal('Hide hidden sections');
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

  it('calls beginEditingNewSection with no arguments when button is clicked', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        sectionIds={[1,2,3]}
        beginEditingNewSection={spy}
      />
    );
    expect(spy).not.to.have.been.called;

    wrapper.find(Button).at(0).simulate('click', {fake: 'event'});
    expect(spy).to.have.been.calledOnce;
    expect(spy.firstCall.args).to.be.empty;
  });
});
