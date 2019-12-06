import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';
import {Button} from '@ml/oceans/ui';
import * as guide from '@ml/oceans/models/guide';

const DEFAULT_PROPS = {
  // radiumConfig.userAgent is required because our unit tests run in the "node" testEnvironment
  // (this is necessary for our tensorflow tests), so Radium thinks we are server-side rendering.
  // See also: https://github.com/FormidableLabs/radium/tree/master/docs/api#configuseragent
  radiumConfig: {userAgent: 'user-agent'}
};

describe('Button', () => {
  it('dismisses guide on click', () => {
    const onClickSpy = event => false;
    const wrapper = shallow(<Button {...DEFAULT_PROPS} onClick={onClickSpy} />);
    wrapper.simulate('click');
  });

  it('calls onClick prop on click', () => {});

  it('plays a sound if onClick prop does not return false', () => {});

  it('does not play a sound if onClick prop returns false', () => {});
});
