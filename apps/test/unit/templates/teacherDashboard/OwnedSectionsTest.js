import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedOwnedSections as OwnedSections} from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import RosterDialog from '@cdo/apps/templates/teacherDashboard/RosterDialog';
import AddSectionDialog from '@cdo/apps/templates/teacherDashboard/AddSectionDialog';
import EditSectionDialog from '@cdo/apps/templates/teacherDashboard/EditSectionDialog';
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

const defaultProps = {
  sectionIds: [11, 12, 13],
  hiddenSectionIds: [],
  asyncLoadComplete: true,
  beginEditingNewSection: () => {},
  beginEditingSection: () => {},
  beginImportRosterFlow: () => {}
};

describe('OwnedSections', () => {
  it('renders SetUpSections when no sections have been created', () => {
    const wrapper = shallow(
      <OwnedSections {...defaultProps} sectionIds={[]} />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <SetUpSections />
        <RosterDialog />
        <AddSectionDialog />
        <EditSectionDialog />
      </div>
    );
  });

  it('renders spinner when sections have not yet loaded', () => {
    const props = {...defaultProps, asyncLoadComplete: false};
    const wrapper = shallow(<OwnedSections {...props} />);
    expect(wrapper).to.containMatchingElement(<Spinner />);
  });

  it('renders a OwnedSectionsTable with no extra button if no archived sections', () => {
    const wrapper = shallow(<OwnedSections {...defaultProps} />);
    expect(wrapper.find('Connect(OwnedSectionsTable)').length).to.equal(1);
    // No button to view hidden (notification button not counted)
    expect(wrapper.find('Button').length).to.equal(0);
  });

  it('renders a OwnedSectionsTable with view button if archived sections', () => {
    const wrapper = shallow(
      <OwnedSections {...defaultProps} hiddenSectionIds={[13]} />
    );
    expect(wrapper.find('Connect(OwnedSectionsTable)').length).to.equal(1);
    // Button to view hidden (notification not counted)
    expect(wrapper.find('Button').length).to.equal(1);
    expect(
      wrapper
        .find('Button')
        .at(0)
        .props().text,
      'View archived sections'
    );
  });

  it('renders two OwnedSectionsTables if view archived sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections {...defaultProps} hiddenSectionIds={[13]} />
    );
    wrapper
      .find('Button')
      .at(0)
      .simulate('click');
    expect(wrapper.find('Connect(OwnedSectionsTable)').length).to.equal(2);
    expect(
      wrapper
        .find('Connect(OwnedSectionsTable)')
        .at(0)
        .props().sectionIds
    ).to.deep.equal([11, 12]);
    expect(
      wrapper
        .find('Connect(OwnedSectionsTable)')
        .at(1)
        .props().sectionIds
    ).to.deep.equal([13]);
    expect(
      wrapper
        .find('Button')
        .at(0)
        .props().text
    ).to.equal('Hide archived sections');
  });

  it('renders just unhidden SectionsAsStudentTable if hide sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections {...defaultProps} hiddenSectionIds={[13]} />
    );
    // Show archived sections
    wrapper
      .find('Button')
      .first()
      .simulate('click');
    // Hide archived sections
    wrapper
      .find('Button')
      .first()
      .simulate('click');
    expect(wrapper.find('Connect(OwnedSectionsTable)').length).to.equal(1);
    expect(
      wrapper.find('Connect(OwnedSectionsTable)').props().sectionIds
    ).to.deep.equal([11, 12]);
  });

  it('renders a SetUpSections about adding a new section', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <OwnedSections
        {...defaultProps}
        sectionIds={[1, 2, 3]}
        beginEditingNewSection={spy}
      />
    );
    expect(spy).not.to.have.been.called;
    expect(wrapper.find(SetUpSections).length).to.equal(1);
  });
});
