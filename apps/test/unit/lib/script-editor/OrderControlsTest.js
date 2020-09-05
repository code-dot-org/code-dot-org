import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import OrderControls from '@cdo/apps/lib/levelbuilder/lesson-editor/OrderControls';

describe('OrderControls', () => {
  let move, remove, defaultProps;
  beforeEach(() => {
    move = sinon.spy();
    remove = sinon.spy();
    defaultProps = {
      move,
      remove,
      name: 'My Lesson'
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
    expect(wrapper.find('.modal-body')).to.have.lengthOf(1);
    expect(wrapper.find('.modal-body').text()).to.include(
      'Are you sure you want to remove'
    );
    expect(remove).not.to.have.been.called;

    const deleteButton = wrapper.find('button').at(1);
    expect(deleteButton.text()).to.include('Delete');
    deleteButton.simulate('click');
    expect(wrapper.find('.modal-body')).to.have.lengthOf(0);
    expect(remove).to.have.been.calledOnce;
  });
  it('does not delete on confirmation dialog cancel', () => {
    const wrapper = mount(<OrderControls {...defaultProps} />);
    wrapper.find('.fa-trash').simulate('mousedown');
    expect(wrapper.find('.modal-body')).to.have.lengthOf(1);
    const cancelButton = wrapper.find('button').at(0);
    expect(cancelButton.text()).to.include('Cancel');
    cancelButton.simulate('click');
    expect(remove).not.to.have.been.called;
    expect(wrapper.find('.modal-body')).to.have.lengthOf(0);
  });
});
