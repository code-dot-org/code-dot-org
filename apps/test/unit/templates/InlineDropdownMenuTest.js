import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {KeyCodes} from '@cdo/apps/constants';
import {InlineDropdownMenu} from '@cdo/apps/templates/InlineDropdownMenu';

const clickSpy = jest.fn();

const defaultProps = {
  icon: 'icon',
  children: [<a href="foo">href</a>, <a onClick={clickSpy}>onclick</a>],
};

describe('InlineDropdownMenu', () => {
  beforeEach(() => clickSpy.mockReset());

  it('is initially just a button', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    expect(wrapper.children().length).toBe(1);
    expect(wrapper.childAt(0).name()).toBe('button');
  });

  it('is hidden if there are no children', () => {
    const wrapper = shallow(<InlineDropdownMenu icon="icon" />);
    expect(wrapper.children().length).toBe(0);
    expect(wrapper).toEqual({});
  });

  it('shows children when clicked', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    wrapper.find('button').invoke('onClick')();
    expect(wrapper.find('a').length).toBe(2);
  });

  it('passes through href', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    wrapper.find('button').invoke('onClick')();
    expect(wrapper.find('a').at(0).props().href).toBe('foo');
  });

  it('passes through onClick and closes dropdown', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    wrapper.find('button').invoke('onClick')();
    wrapper.find('a').at(1).invoke('onClick')();
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // dropdown is closed
    expect(wrapper.find('a').length).toBe(0);
  });

  it('passes through keyboard action and closes dropdown', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    wrapper.find('button').invoke('onClick')();
    wrapper.find('a').at(1).invoke('onKeyDown')({which: KeyCodes.ENTER});
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // dropdown is closed
    expect(wrapper.find('a').length).toBe(0);
  });

  it('throws an error if neither icon nor selector was supplied', () => {
    expect(() => {
      shallow(<InlineDropdownMenu />);
    }).toThrow('Icon or selector must be supplied.');
  });
});
