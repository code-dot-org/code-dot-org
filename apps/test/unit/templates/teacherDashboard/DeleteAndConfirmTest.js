import {assert} from '../../../util/configuredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import DeleteAndConfirm from '@cdo/apps/templates/teacherDashboard/DeleteAndConfirm';

describe('DeleteAndConfirm', () => {
  it('begins with just a delete button', () => {
    const wrapper = shallow(
      <DeleteAndConfirm onConfirm={() => {}}/>
    );
    assert.equal(wrapper.find('Button').length, 1);
    assert.equal(wrapper.find('Button').props().text, 'Delete');
  });

  it('replaces with confirmation after clicking delete', () => {
    const wrapper = shallow(
      <DeleteAndConfirm onConfirm={() => {}}/>
    );
    wrapper.find('Button').simulate('click');
    assert.equal(wrapper.state('deleting'), true);
    assert.equal(wrapper.find('Button').length, 2);
    assert.equal(wrapper.find('Button').at(0).props().text, 'Yes');
    assert.equal(wrapper.find('Button').at(1).props().text, 'No');
  });

  it('returns to original state if no clicked', () => {
    const wrapper = shallow(
      <DeleteAndConfirm onConfirm={() => {}}/>
    );
    wrapper.find('Button').simulate('click');
    wrapper.find('Button').at(1).simulate('click');
    assert.equal(wrapper.state('deleting'), false);
    assert.equal(wrapper.find('Button').props().text, 'Delete');
  });

  it('calls onConfirm if yes clicked', () => {
    const confirm = sinon.spy();
    const wrapper = shallow(
      <DeleteAndConfirm onConfirm={confirm}/>
    );
    wrapper.find('Button').simulate('click');
    wrapper.find('Button').at(0).simulate('click');
    assert(confirm.called);
  });
});
