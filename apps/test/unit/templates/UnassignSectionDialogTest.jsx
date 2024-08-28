import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UnassignSectionDialog from '@cdo/apps/templates/UnassignSectionDialog';

const DEFAULT_PROPS = {
  isOpen: true,
  sectionId: 1,
  onClose: () => {},
  cancelUnassign: () => {},
  unassignSection: () => {},
  courseName: 'myCourse',
  sectionName: 'mySection',
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<UnassignSectionDialog {...props} />);
};

describe('UnassignSectionDialog', () => {
  it('calls unassign function when unassign button clicked', () => {
    const unassignSpy = jest.fn();
    const wrapper = setUp({unassignSection: unassignSpy});

    const button = wrapper.find('Button').at(2);

    button.simulate('click');
    expect(unassignSpy).toHaveBeenCalledTimes(1);
  });

  it('calls cancel function when user clicks cancel', () => {
    const cancelSpy = jest.fn();
    const wrapper = setUp({cancelUnassign: cancelSpy});
    const button = wrapper.find('Button').at(1);

    button.simulate('click');
    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('displays the right section and unit text', () => {
    const wrapper = setUp();

    expect(
      wrapper
        .find({id: 'unassign-dialog-body'})
        .contains(
          'Your students in mySection will no longer be taken to myCourse when they sign in.'
        )
    ).toBe(true);

    expect(wrapper.text().includes('Unassign myCourse')).toBe(true);
  });
});
