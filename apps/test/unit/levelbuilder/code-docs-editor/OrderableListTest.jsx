import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import OrderableList from '@cdo/apps/levelbuilder/code-docs-editor/OrderableList';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('OrderableList', () => {
  let defaultProps, setListSpy, renderItemSpy;

  beforeEach(() => {
    setListSpy = sinon.spy();
    renderItemSpy = sinon.spy();
    defaultProps = {
      list: [{key: '1'}, {key: '2'}, {key: '3'}],
      setList: setListSpy,
      addButtonText: 'Add New',
      renderItem: renderItemSpy,
    };
  });

  it('calls renderItem for each item in the list', () => {
    shallow(<OrderableList {...defaultProps} />);
    expect(renderItemSpy.callCount).to.equal(3);
    expect(renderItemSpy.getCalls().map(c => c.args[0])).to.eql([
      {key: '1'},
      {key: '2'},
      {key: '3'},
    ]);
  });

  it('can add new item to list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(setListSpy).to.be.called.once;
    expect(setListSpy.getCall(0).args[0].length).to.equal(4);
  });

  it('can remove item from list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper.find('.fa-trash').at(1).simulate('click');
    expect(setListSpy).to.be.calledOnce.and.calledWith([
      {key: '1'},
      {key: '3'},
    ]);
  });

  it('can move item up in list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    // The first item does not have a caret up, so we are moving the second item up here
    wrapper.find('.fa-caret-up').at(0).simulate('click');
    expect(setListSpy).to.be.calledOnce.and.calledWith([
      {key: '2'},
      {key: '1'},
      {key: '3'},
    ]);
  });

  it('can move down up in list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper.find('.fa-caret-down').at(0).simulate('click');
    expect(setListSpy).to.be.calledOnce.and.calledWith([
      {key: '2'},
      {key: '1'},
      {key: '3'},
    ]);
  });

  it('hides delete button if item isnt deletable', () => {
    const wrapper = shallow(
      <OrderableList
        {...defaultProps}
        checkItemDeletionAllowed={item => item.key === '3'}
      />
    );
    expect(wrapper.find('.fa-trash').length).to.equal(1);
  });
});
