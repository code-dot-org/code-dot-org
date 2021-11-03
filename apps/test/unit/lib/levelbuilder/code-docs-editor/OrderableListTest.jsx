import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import OrderableList from '@cdo/apps/lib/levelbuilder/code-docs-editor/OrderableList';
import sinon from 'sinon';

describe('OrderableList', () => {
  let defaultProps, setListSpy;

  beforeEach(() => {
    setListSpy = sinon.spy();
    defaultProps = {
      list: [{key: 1}, {key: 2}, {key: 3}],
      setList: setListSpy,
      addButtonText: 'Add New'
    };
  });

  it('can add new item to list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(setListSpy).to.be.called.once;
    expect(setListSpy.getCall(0).args[0].length).to.equal(4);
  });

  it('can remove item from list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper
      .find('.fa-trash')
      .at(1)
      .simulate('click');
    expect(setListSpy).to.be.calledOnce.and.calledWith([{key: 1}, {key: 3}]);
  });

  it('can move item up in list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    // The first item does not have a caret up, so we are moving the second item up here
    wrapper
      .find('.fa-caret-up')
      .at(0)
      .simulate('click');
    expect(setListSpy).to.be.calledOnce.and.calledWith([
      {key: 2},
      {key: 1},
      {key: 3}
    ]);
  });

  it('can move down up in list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper
      .find('.fa-caret-down')
      .at(0)
      .simulate('click');
    expect(setListSpy).to.be.calledOnce.and.calledWith([
      {key: 2},
      {key: 1},
      {key: 3}
    ]);
  });
});
