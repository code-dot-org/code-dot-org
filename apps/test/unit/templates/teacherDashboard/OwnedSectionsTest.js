import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedOwnedSections as OwnedSections} from '@cdo/apps/templates/teacherDashboard/OwnedSections';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const defaultProps = {
  sectionIds: [11, 12, 13],
  hiddenSectionIds: [],
  beginEditingSection: () => {},
  isPlSections: false,
};

describe('OwnedSections', () => {
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
    expect(wrapper.find('Button').at(0).props().text, 'View archived sections');
  });

  it('renders two OwnedSectionsTables if view archived sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections {...defaultProps} hiddenSectionIds={[13]} />
    );
    wrapper.find('Button').at(0).simulate('click');
    expect(wrapper.find('Connect(OwnedSectionsTable)').length).to.equal(2);
    expect(
      wrapper.find('Connect(OwnedSectionsTable)').at(0).props().sectionIds
    ).to.deep.equal([11, 12]);
    expect(
      wrapper.find('Connect(OwnedSectionsTable)').at(1).props().sectionIds
    ).to.deep.equal([13]);
    expect(wrapper.find('Button').at(0).props().text).to.equal(
      'Hide archived sections'
    );
  });

  it('renders just unhidden SectionsAsStudentTable if hide sections clicked', () => {
    const wrapper = shallow(
      <OwnedSections {...defaultProps} hiddenSectionIds={[13]} />
    );
    // Show archived sections
    wrapper.find('Button').first().simulate('click');
    // Hide archived sections
    wrapper.find('Button').first().simulate('click');
    expect(wrapper.find('Connect(OwnedSectionsTable)').length).to.equal(1);
    expect(
      wrapper.find('Connect(OwnedSectionsTable)').props().sectionIds
    ).to.deep.equal([11, 12]);
  });
});
