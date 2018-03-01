/** @file Test PopUpMenu component */
import React from 'react';
import sinon from 'sinon';
import msg from '@cdo/locale';
import {expect} from '../../../util/configuredChai';
import {mount} from 'enzyme';
import PopUpMenu, {MenuBubble} from '@cdo/apps/lib/ui/PopUpMenu';

describe('PopUpMenu', () => {
  const targetPoint = {left: 0, top:0};

  it('renders placeholder text if no menu items are provided', () => {
    const wrapper = mount(
      <MenuBubble targetPoint={targetPoint}/>
    );
    expect(wrapper.text()).to.include(msg.noMenuItemsAvailable());
  });

  it('renders each menu item', () => {
    const wrapper = mount(
      <MenuBubble targetPoint={targetPoint}>
        <PopUpMenu.Item onClick={() => {}}>Item one</PopUpMenu.Item>
        <PopUpMenu.Item onClick={() => {}}>Item two</PopUpMenu.Item>
        <PopUpMenu.Item onClick={() => {}}>Item three</PopUpMenu.Item>
      </MenuBubble>
    );
    expect(wrapper.text())
        .to.include('Item one')
        .and.to.include('Item two')
        .and.to.include('Item three');
  });

  it('has working click handlers for menu items', () => {
    const spy1 = sinon.spy();
    const spy2 = sinon.spy();
    const wrapper = mount(
      <MenuBubble targetPoint={targetPoint}>
        <PopUpMenu.Item onClick={spy1}>Item one</PopUpMenu.Item>
        <PopUpMenu.Item onClick={spy2}>Item two</PopUpMenu.Item>
      </MenuBubble>
    );
    wrapper.find(PopUpMenu.Item).first().children().first().simulate('click');
    expect(spy1).to.have.been.calledOnce;
    expect(spy2).not.to.have.been.called;
  });
});
