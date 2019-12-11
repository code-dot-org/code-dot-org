import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {Button, ConfirmationDialog} from '@ml/oceans/ui';
import * as guide from '@ml/oceans/models/guide';
import * as soundLibrary from '@ml/oceans/models/soundLibrary';

const DEFAULT_PROPS = {
  // radiumConfig.userAgent is required because our unit tests run in the "node" testEnvironment
  // (this is necessary for our tensorflow tests), so Radium thinks we are server-side rendering.
  // See also: https://github.com/FormidableLabs/radium/tree/master/docs/api#configuseragent
  radiumConfig: {userAgent: 'user-agent'}
};

describe('Button', () => {
  let onClickMock, playSoundSpy;

  beforeEach(() => {
    soundLibrary.injectSoundAPIs({playSound: sinon.fake()});
    playSoundSpy = sinon.spy(soundLibrary, 'playSound');
    onClickMock = sinon.fake.returns(false);
  });

  afterEach(() => {
    soundLibrary.playSound.restore();
  });

  it('dismisses guide on click', () => {
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

  it('does not play a sound if onClick prop returns false', () => {
    const wrapper = shallow(
      <Button {...DEFAULT_PROPS} onClick={onClickMock} />
    );

    wrapper.simulate('click');
    expect(!playSoundSpy.called);
  });

  describe('onClick prop does not return false', () => {
    it('plays sound if supplied', () => {
      onClickMock = sinon.fake.returns(true);
      const wrapper = shallow(
        <Button {...DEFAULT_PROPS} onClick={onClickMock} sound="sortyes" />
      );

      wrapper.simulate('click');
      expect(playSoundSpy.withArgs('sortyes').calledOnce);
    });

    it('plays "other" sound if sound not supplied', () => {
      onClickMock = sinon.fake.returns(true);
      const wrapper = shallow(
        <Button {...DEFAULT_PROPS} onClick={onClickMock} />
      );

      wrapper.simulate('click');
      expect(playSoundSpy.withArgs('other').calledOnce);
    });
  });
});

describe('ConfirmationDialog', () => {
  let onYesClickSpy, onNoClickSpy;

  beforeEach(() => {
    onYesClickSpy = sinon.spy();
    onNoClickSpy = sinon.spy();
  });

  it('calls onYesClick prop when erase button is clicked', () => {
    const wrapper = shallow(
      <ConfirmationDialog
        {...DEFAULT_PROPS}
        onYesClick={onYesClickSpy}
        onNoClick={onNoClickSpy}
      />
    );

    const eraseButton = wrapper.find('Button').at(0);
    eraseButton.simulate('click');
    expect(onYesClickSpy.calledOnce);
    expect(!onNoClickSpy.called);
  });

  it('calls onNoClick prop when cancel button is clicked', () => {
    const wrapper = shallow(
      <ConfirmationDialog
        {...DEFAULT_PROPS}
        onYesClick={onYesClickSpy}
        onNoClick={onNoClickSpy}
      />
    );

    const cancelButton = wrapper.find('Button').at(1);
    cancelButton.simulate('click');
    expect(onNoClickSpy.calledOnce);
    expect(!onYesClickSpy.called);
  });
});
