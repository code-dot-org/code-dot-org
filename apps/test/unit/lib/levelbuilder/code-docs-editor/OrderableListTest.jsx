import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import OrderableList from '@cdo/apps/lib/levelbuilder/code-docs-editor/OrderableList';



describe('OrderableList', () => {
  let defaultProps, setListSpy, renderItemSpy;

  beforeEach(() => {
    setListSpy = jest.fn();
    renderItemSpy = jest.fn();
    defaultProps = {
      list: [{key: '1'}, {key: '2'}, {key: '3'}],
      setList: setListSpy,
      addButtonText: 'Add New',
      renderItem: renderItemSpy,
    };
  });

  it('calls renderItem for each item in the list', () => {
    shallow(<OrderableList {...defaultProps} />);
    expect(renderItemSpy).toHaveBeenCalledTimes(3);
    expect(renderItemSpy.mock.calls.map(c => c.mock.calls[0])).toEqual([
      {key: '1'},
      {key: '2'},
      {key: '3'},
    ]);
  });

  it('can add new item to list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(setListSpy).toHaveBeenCalled().once;
    expect(setListSpy.mock.calls[0][0].length).toBe(4);
  });

  it('can remove item from list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper.find('.fa-trash').at(1).simulate('click');
    expect(setListSpy).toHaveBeenCalledWith([
      {key: '1'},
      {key: '3'},
    ]);
  });

  it('can move item up in list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    // The first item does not have a caret up, so we are moving the second item up here
    wrapper.find('.fa-caret-up').at(0).simulate('click');
    expect(setListSpy).toHaveBeenCalledWith([
      {key: '2'},
      {key: '1'},
      {key: '3'},
    ]);
  });

  it('can move down up in list', () => {
    const wrapper = shallow(<OrderableList {...defaultProps} />);
    wrapper.find('.fa-caret-down').at(0).simulate('click');
    expect(setListSpy).toHaveBeenCalledWith([
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
    expect(wrapper.find('.fa-trash').length).toBe(1);
  });
});
