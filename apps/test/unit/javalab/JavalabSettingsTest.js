import {assert} from '../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {JavalabSettings} from '@cdo/apps/javalab/JavalabSettings';

const clickSpy = sinon.spy();

const defaultProps = {
  style: {},
  children: [
    <button onClick={clickSpy} type="button">
      onclick
    </button>,
    <button onClick={clickSpy} type="button">
      onclick2
    </button>
  ]
};

describe('JavalabSettings', () => {
  beforeEach(() => clickSpy.resetHistory());

  it('is initially just a button', () => {
    const wrapper = shallow(<JavalabSettings {...defaultProps} />);
    assert.strictEqual(wrapper.children().length, 1);
    assert.strictEqual(wrapper.childAt(0).name(), 'JavalabButton');
  });

  it('shows children when clicked', () => {
    const wrapper = shallow(<JavalabSettings {...defaultProps} />);
    wrapper.instance().toggleDropdown();
    assert.strictEqual(wrapper.find('button').length, 2);
  });

  it('passes through onClick and closes dropdown', () => {
    const wrapper = shallow(<JavalabSettings {...defaultProps} />);
    wrapper.instance().toggleDropdown();
    assert(
      wrapper
        .find('button')
        .at(1)
        .props().onClick
    );
    wrapper
      .find('button')
      .at(1)
      .props()
      .onClick();
    assert(clickSpy.calledOnce);

    // dropdown is closed
    assert.equal(wrapper.find('button').length, 0);
  });
});
