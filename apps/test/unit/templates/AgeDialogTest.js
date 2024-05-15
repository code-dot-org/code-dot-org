import {assert} from 'chai';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import {UnconnectedAgeDialog as AgeDialog} from '@cdo/apps/templates/AgeDialog';

import FakeStorage from '../../util/FakeStorage';

describe('AgeDialog', () => {
  const defaultProps = {
    signedIn: false,
    turnOffFilter: () => {},
    setOver21: () => {},
    storage: new FakeStorage(),
    unitName: 'csd-2023',
  };

  it('renders null if user is signed in', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} signedIn={true} />);
    assert.equal(wrapper.children().length, 0);
  });

  it('renders null if dialog was seen before', () => {
    let getItem = sinon.stub(defaultProps.storage, 'getItem');
    getItem.withArgs('ad_anon_over13').returns('true');
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.children().length, 0);
    getItem.restore();
  });

  it('renders a dialog if neither signed in nor seen before', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.name(), 'BaseDialog');
  });
});
