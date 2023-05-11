import {expect} from '../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {InlineDropdownMenu} from '@cdo/apps/templates/InlineDropdownMenu';
import {KeyCodes} from '@cdo/apps/constants';

const clickSpy = sinon.spy();

const defaultProps = {
  icon: 'icon',
  children: [<a href="foo">href</a>, <a onClick={clickSpy}>onclick</a>],
};

describe('InlineDropdownMenu', () => {
  beforeEach(() => clickSpy.resetHistory());

  it('is initially just a button', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    expect(wrapper.children().length).to.equal(1);
    expect(wrapper.childAt(0).name()).to.equal('button');
  });

  it('is hidden if there are no children', () => {
    const wrapper = shallow(<InlineDropdownMenu icon="icon" />);
    expect(wrapper.children().length).to.equal(0);
    expect(wrapper).to.deep.equal({});
  });

  it('shows children when clicked', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    wrapper.find('button').invoke('onClick')();
    expect(wrapper.find('a').length).to.equal(2);
  });

  it('passes through href', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    wrapper.find('button').invoke('onClick')();
    expect(wrapper.find('a').at(0).props().href).to.equal('foo');
  });

  it('passes through onClick and closes dropdown', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    wrapper.find('button').invoke('onClick')();
    wrapper.find('a').at(1).invoke('onClick')();
    expect(clickSpy.calledOnce).to.be.true;

    // dropdown is closed
    expect(wrapper.find('a').length).to.equal(0);
  });

  it('passes through keyboard action and closes dropdown', () => {
    const wrapper = shallow(<InlineDropdownMenu {...defaultProps} />);
    wrapper.find('button').invoke('onClick')();
    wrapper.find('a').at(1).invoke('onKeyDown')({which: KeyCodes.ENTER});
    expect(clickSpy.calledOnce).to.be.true;

    // dropdown is closed
    expect(wrapper.find('a').length).to.equal(0);
  });

  it('throws an error if neither icon nor selector was supplied', () => {
    expect(() => {
      shallow(<InlineDropdownMenu />);
    }).to.throw('Icon or selector must be supplied.');
  });
});
