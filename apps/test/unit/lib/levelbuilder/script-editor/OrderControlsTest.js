import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';

import {expect} from '../../../../util/reconfiguredChai';

describe('OrderControls', () => {
  let move, remove, defaultProps;
  beforeEach(() => {
    move = sinon.spy();
    remove = sinon.spy();
    defaultProps = {
      move,
      remove,
      name: 'My Lesson',
    };
  });
  it('renders default props', () => {
    const wrapper = mount(<OrderControls {...defaultProps} />);
    expect(wrapper.find('.fa-trash')).to.have.lengthOf(1);
  });
  it('shows confirmation dialog before deleting', () => {
    const wrapper = mount(<OrderControls {...defaultProps} />);
    expect(wrapper.find('.fa-trash')).to.have.lengthOf(1);

    wrapper.find('.fa-trash').simulate('mousedown');
    expect(wrapper.find('.modal')).to.have.lengthOf(1);
    expect(wrapper.find('.modal').text()).to.include(
      'Are you sure you want to remove'
    );
    expect(remove).not.to.have.been.called;

    const deleteButton = wrapper.find('Button').at(2);
    expect(deleteButton.text()).to.include('Delete');
    deleteButton.simulate('click');
    expect(wrapper.find('.modal')).to.have.lengthOf(0);
    expect(remove).to.have.been.calledOnce;
  });
  it('does not delete on confirmation dialog cancel', () => {
    const wrapper = mount(<OrderControls {...defaultProps} />);
    wrapper.find('.fa-trash').simulate('mousedown');
    expect(wrapper.find('.modal')).to.have.lengthOf(1);
    const cancelButton = wrapper.find('Button').at(1);
    expect(cancelButton.text()).to.include('Cancel');
    cancelButton.simulate('click');
    expect(remove).not.to.have.been.called;
    expect(wrapper.find('.modal')).to.have.lengthOf(0);
  });
});
