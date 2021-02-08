import React from 'react';
import {SignInCallout as Callout} from '@cdo/apps/code-studio/components/header/SignInCallout';
import {shallow} from 'enzyme';

var assert = require('assert');

describe('ViewPopup', () => {
  it('renders a sign in reminder popup', () => {
    const wrapper = shallow(<Callout />);

    assert.equal(wrapper.find('.modal-backdrop').length, 1);
    assert.equal(wrapper.find('.modal-backdrop').at(0), 'link');
    assert.equal(wrapper.find('.modal-backdrop').opacity, 0.5);
  });
});
