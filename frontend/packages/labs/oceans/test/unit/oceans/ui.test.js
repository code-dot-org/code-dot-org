import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {Button} from '@ml/oceans/ui';
import * as guide from '@ml/oceans/models/guide';

const DEFAULT_PROPS = {
  // radiumConfig.userAgent is required because our unit tests run in the "node" testEnvironment
  // (this is necessary for our tensorflow tests), so Radium thinks we are server-side rendering.
  // See also: https://github.com/FormidableLabs/radium/tree/master/docs/api#configuseragent
  radiumConfig: {userAgent: 'user-agent'}
};

describe('Button', () => {
  let onClickMock;

  beforeEach(() => {
    onClickMock = sinon.fake.returns(false);
  });

  it('dismisses guide on click', () => {
    guide.dismissCurrentGuide();
    const dismissCurrentGuideSpy = sinon.spy(guide, 'dismissCurrentGuide');
    const wrapper = shallow(
      <Button {...DEFAULT_PROPS} onClick={onClickMock} />
    );

    wrapper.simulate('click');
    expect(dismissCurrentGuideSpy.calledOnce);

    guide.dismissCurrentGuide.restore();
  });

  it('calls onClick prop on click', () => {
    const wrapper = shallow(
      <Button {...DEFAULT_PROPS} onClick={onClickMock} />
    );

    wrapper.simulate('click');
    expect(onClickMock.calledOnce);
  });

  it('plays a sound if onClick prop does not return false', () => {});

  it('does not play a sound if onClick prop returns false', () => {});
});
