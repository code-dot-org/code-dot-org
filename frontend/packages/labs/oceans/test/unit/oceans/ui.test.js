import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {Button, ConfirmationDialog, Words, wordSet} from '@ml/oceans/ui';
import guide from '@ml/oceans/models/guide';
import soundLibrary from '@ml/oceans/models/soundLibrary';
import modeHelpers from '@ml/oceans/modeHelpers';
import {setState, getState, resetState} from '@ml/oceans/state';
import {AppMode, Modes} from '@ml/oceans/constants';

const DEFAULT_PROPS = {
  // radiumConfig.userAgent is required because our unit tests run in the "node" testEnvironment
  // (this is necessary for our tensorflow tests), so Radium thinks we are server-side rendering.
  // See also: https://github.com/FormidableLabs/radium/tree/master/docs/api#configuseragent
  radiumConfig: {userAgent: 'user-agent'}
};

describe('Button', () => {
  let onClickMock, playSoundStub;

  beforeEach(() => {
    playSoundStub = sinon.stub(soundLibrary, 'playSound');
    onClickMock = sinon.fake.returns(false);
  });

  afterEach(() => {
    soundLibrary.playSound.restore();
  });

  it('dismisses guide on click', () => {
    const dismissCurrentGuideSpy = sinon.stub(guide, 'dismissCurrentGuide');
    const wrapper = shallow(
      <Button {...DEFAULT_PROPS} onClick={onClickMock} />
    );

    wrapper.simulate('click');
    expect(dismissCurrentGuideSpy.callCount).toEqual(1);

    guide.dismissCurrentGuide.restore();
  });

  it('calls onClick prop on click', () => {
    const wrapper = shallow(
      <Button {...DEFAULT_PROPS} onClick={onClickMock} />
    );

    wrapper.simulate('click');
    expect(onClickMock.callCount).toEqual(1);
  });

  it('does not play a sound if onClick prop returns false', () => {
    const wrapper = shallow(
      <Button {...DEFAULT_PROPS} onClick={onClickMock} />
    );

    wrapper.simulate('click');
    expect(playSoundStub.callCount).toEqual(0);
  });

  describe('onClick prop does not return false', () => {
    it('plays sound if supplied', () => {
      onClickMock = sinon.fake.returns(true);
      const wrapper = shallow(
        <Button {...DEFAULT_PROPS} onClick={onClickMock} sound="sortyes" />
      );

      wrapper.simulate('click');
      expect(playSoundStub.withArgs('sortyes').calledOnce).toBeTruthy();
    });

    it('plays "other" sound if sound not supplied', () => {
      onClickMock = sinon.fake.returns(true);
      const wrapper = shallow(
        <Button {...DEFAULT_PROPS} onClick={onClickMock} />
      );

      wrapper.simulate('click');
      expect(playSoundStub.withArgs('other').calledOnce).toBeTruthy();
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
    expect(onYesClickSpy.callCount).toEqual(1);
    expect(onNoClickSpy.callCount).toEqual(0);
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
    expect(onNoClickSpy.callCount).toEqual(1);
    expect(onYesClickSpy.callCount).toEqual(0);
  });
});

describe('Words', () => {
  afterEach(() => {
    resetState();
  });

  it('selects the set of words based on the current appMode', () => {
    const appMode = AppMode.FishShort;
    setState({appMode});
    const wrapper = shallow(<Words {...DEFAULT_PROPS} />);
    const wordChoices = wrapper.state().choices;
    // Flatten the array of choices as we know it is 2D.
    const expectedChoices = [].concat.apply([], wordSet[appMode].choices);

    // We expect the actual word choices to be randomly sorted
    expect(wordChoices).not.toEqual(expectedChoices);
    expect(wordChoices.sort()).toEqual(expectedChoices.sort());
  });

  it('throws an error if no set of words are found for the current appMode', () => {
    setState({appMode: 'a-fake-one!'});

    expect(() => {
      shallow(<Words {...DEFAULT_PROPS} />);
    }).toThrowError(
      new Error(
        "Could not find a set of choices in wordSet for appMode 'a-fake-one!'"
      )
    );
  });

  describe('onChangeWord', () => {
    let toModeStub;

    beforeEach(() => {
      toModeStub = sinon.stub(modeHelpers, 'toMode');
      setState({appMode: AppMode.FishLong});
    });

    afterEach(() => {
      modeHelpers.toMode.restore();
      resetState();
    });

    it('sets the selected word in state', () => {
      const wrapper = shallow(<Words {...DEFAULT_PROPS} />);

      const i = 1;
      wrapper
        .find('Button')
        .at(i)
        .simulate('click');
      const expectedWord = wrapper.state().choices[i];
      expect(getState().word).toEqual(expectedWord);
    });

    it('transitions to Modes.Training', () => {
      const wrapper = shallow(<Words {...DEFAULT_PROPS} />);

      wrapper
        .find('Button')
        .at(0)
        .simulate('click');
      expect(toModeStub.withArgs(Modes.Training).calledOnce).toBeTruthy();
    });

    it('reports an analytics event if window.trackEvent is provided', () => {
      window.trackEvent = sinon.spy();
      const wrapper = shallow(<Words {...DEFAULT_PROPS} />);

      wrapper
        .find('Button')
        .at(0)
        .simulate('click');
      expect(window.trackEvent.calledOnce).toBeTruthy();
    });
  });
});
