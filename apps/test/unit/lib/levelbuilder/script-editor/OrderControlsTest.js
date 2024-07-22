import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';

describe('OrderControls', () => {
  let move, remove, defaultProps;
  beforeEach(() => {
    move = jest.fn();
    remove = jest.fn();
    defaultProps = {
      move,
      remove,
      name: 'My Lesson',
    };
  });
  it('renders default props', () => {
    const wrapper = mount(<OrderControls {...defaultProps} />);
    expect(wrapper.find('.fa-trash')).toHaveLength(1);
  });
  it('shows confirmation dialog before deleting', () => {
    const wrapper = mount(<OrderControls {...defaultProps} />);
    expect(wrapper.find('.fa-trash')).toHaveLength(1);

    wrapper.find('.fa-trash').simulate('mousedown');
    expect(wrapper.find('.modal')).toHaveLength(1);
    expect(wrapper.find('.modal').text()).toContain(
      'Are you sure you want to remove'
    );
    expect(remove).not.toHaveBeenCalled();

    const deleteButton = wrapper.find('Button').at(2);
    expect(deleteButton.text()).toContain('Delete');
    deleteButton.simulate('click');
    expect(wrapper.find('.modal')).toHaveLength(0);
    expect(remove).toHaveBeenCalledTimes(1);
  });
  it('does not delete on confirmation dialog cancel', () => {
    const wrapper = mount(<OrderControls {...defaultProps} />);
    wrapper.find('.fa-trash').simulate('mousedown');
    expect(wrapper.find('.modal')).toHaveLength(1);
    const cancelButton = wrapper.find('Button').at(1);
    expect(cancelButton.text()).toContain('Cancel');
    cancelButton.simulate('click');
    expect(remove).not.toHaveBeenCalled();
    expect(wrapper.find('.modal')).toHaveLength(0);
  });
});
