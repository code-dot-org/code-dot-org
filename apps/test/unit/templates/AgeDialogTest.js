import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
    let getItem = jest
      .spyOn(defaultProps.storage, 'getItem')
      .mockClear()
      .mockImplementation();
    getItem.mockImplementation((...args) => {
      if (args[0] === 'ad_anon_over13') {
        return 'true';
      }
    });
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.children().length, 0);
    getItem.mockRestore();
  });

  it('renders a dialog if neither signed in nor seen before', () => {
    const wrapper = shallow(<AgeDialog {...defaultProps} />);
    assert.equal(wrapper.name(), 'BaseDialog');
  });
});
