import {assert} from '../../util/reconfiguredChai';
import React from 'react';
import {UnconnectedAgeDialog as AgeDialog} from '@cdo/apps/templates/AgeDialog';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {replaceOnWindow, restoreOnWindow} from '../../util/testUtils';

describe('AgeDialog', () => {
  const defaultProps = {
    signedIn: false,
    turnOffFilter: () => {}
  };

  before(() => {
    replaceOnWindow('sessionStorage', {
      getItem: () => {},
      setItem: () => {}
    });
  });

  after(() => {
    restoreOnWindow('sessionStorage');
  });

  it('renders null if user is signed in', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} signedIn={true} />);
    assert.equal(wrapper.children().length, 0);
  });

  it('renders null if dialog was seen before', () => {
    let getItem = sinon.stub(window.sessionStorage, 'getItem').returns('true');
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.children().length, 0);
    getItem.restore();
  });

  it('renders a dialog if neither signed in nor seen before', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.name(), 'BaseDialog');
  });
});
