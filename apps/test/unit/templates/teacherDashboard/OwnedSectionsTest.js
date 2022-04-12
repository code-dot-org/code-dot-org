import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedOwnedSections as OwnedSections} from '@cdo/apps/templates/teacherDashboard/OwnedSections';

const defaultProps = {
  studentSectionIds: [11, 12, 13],
  plSectionIds: [],
  hiddenPlSectionIds: [],
  hiddenStudentSectionIds: [],
  asyncLoadComplete: true,
  beginEditingSection: () => {},
  beginImportRosterFlow: () => {},
  isPlSections: false
};

describe('OwnedSections', () => {
  it('renders SetUpSections when no sections have been created', () => {
    const wrapper = shallow(
      <OwnedSections {...defaultProps} studentSectionIds={[]} />
    );
    expect(wrapper.find('Connect(SetUpSections)').length).to.equal(1);
  });

  it('renders spinner when sections have not yet loaded', () => {
    const props = {...defaultProps, asyncLoadComplete: false};
    const wrapper = shallow(<OwnedSections {...props} />);
    expect(wrapper.find('Spinner').length).to.equal(1);
  });

  it('renders a OwnedSectionsTable with no extra button if no archived sections', () => {
    const wrapper = shallow(<OwnedSections {...defaultProps} />);
    expect(wrapper.find('Connect(OwnedSectionsTable)').length).to.equal(1);
    // No button to view hidden (notification button not counted)
    expect(wrapper.find('Button').length).to.equal(0);
  });

  it('renders a OwnedSectionsTable with view button if archived student sections', () => {
    const wrapper = shallow(
      <OwnedSections {...defaultProps} hiddenStudentSectionIds={[13]} />
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
      <OwnedSections {...defaultProps} hiddenStudentSectionIds={[13]} />
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
      <OwnedSections {...defaultProps} hiddenStudentSectionIds={[13]} />
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
        beginEditingSection={spy}
      />
    );
    expect(spy).not.to.have.been.called;
    expect(wrapper.find('Connect(SetUpSections)').length).to.equal(1);
  });
});
