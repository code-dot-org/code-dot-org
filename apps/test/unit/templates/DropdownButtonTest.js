import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Button from '@cdo/apps/templates/Button';
import {DropdownButton} from '@cdo/apps/templates/DropdownButton';

const clickSpy = sinon.spy();

const defaultProps = {
  text: 'Click me',
  color: Button.ButtonColor.brandSecondaryDefault,
  children: [<a href="foo">href</a>, <a onClick={clickSpy}>onclick</a>],
};

describe('DropdownButton', () => {
  beforeEach(() => clickSpy.resetHistory());

  it('is initially just a button', () => {
    const wrapper = shallow(<DropdownButton {...defaultProps} />);
    expect(wrapper.children().length).toBe(1);
    expect(wrapper.childAt(0).name()).toBe('Button');
  });

  it('shows children when clicked', () => {
    const wrapper = shallow(<DropdownButton {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(wrapper.find('a').length).toBe(2);
  });

  it('passes through href', () => {
    const wrapper = shallow(<DropdownButton {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(wrapper.find('a').at(0).props().href).toBe('foo');
  });

  it('passes through onClick and closes dropdown', () => {
    const wrapper = shallow(<DropdownButton {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(wrapper.find('a').at(1).props().onClick).toBeTruthy();
    wrapper.find('a').at(1).simulate('click');
    expect(clickSpy.calledOnce).toBeTruthy();

    // dropdown is closed
    expect(wrapper.find('a').length).toEqual(0);
  });
});
