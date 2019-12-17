import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {
  Button,
  ConfirmationDialog,
  Words,
  wordSet,
  Train,
  Predict,
  Pond,
  Guide
} from '@ml/oceans/ui';
import guide from '@ml/oceans/models/guide';
import soundLibrary from '@ml/oceans/models/soundLibrary';
import train from '@ml/oceans/models/train';
import modeHelpers from '@ml/oceans/modeHelpers';
import helpers from '@ml/oceans/helpers';
import {setState, getState, resetState} from '@ml/oceans/state';
import {AppMode, Modes} from '@ml/oceans/constants';
import colors from '@ml/oceans/colors';

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

describe('Train', () => {
  let classifyFishStub;

  beforeEach(() => {
    classifyFishStub = sinon.stub(train, 'onClassifyFish');
  });

  afterEach(() => {
    train.onClassifyFish.restore();
    resetState();
  });

  it('displays the current training count', () => {
    setState({yesCount: 10, noCount: 23});
    const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
    const trainCount = wrapper.find('#uitest-train-count');

    expect(trainCount.text()).toEqual('33');
  });

  it('displays 999 if current training count is greater than 999', () => {
    setState({yesCount: 1000, noCount: 1});
    const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
    const trainCount = wrapper.find('#uitest-train-count');

    expect(trainCount.text()).toEqual('999');
  });

  it('sets state to display confirmation dialog when erase icon is clicked', () => {
    const initialState = getState();
    expect(initialState.showConfirmationDialog).toBeFalsy();
    expect(initialState.confirmationDialogOnYes).toBeNull();

    const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
    const eraseIcon = wrapper.find('FontAwesomeIcon').at(0);
    eraseIcon.simulate('click');

    const newState = getState();
    expect(newState.showConfirmationDialog).toBeTruthy();
    expect(newState.confirmationDialogOnYes).not.toBeNull();
  });

  describe('train "no" button', () => {
    const getNoButton = wrapper => wrapper.find('Button').at(0);

    it('displays the current word when not in AppMode.CreaturesVTrash', () => {
      setState({appMode: 'not-creatures-v-trash', word: 'Spooky'});
      const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
      const noButton = getNoButton(wrapper).render();

      expect(noButton.text().trimLeft()).toEqual('Not Spooky');
    });

    it('displays "no" in AppMode.CreaturesVTrash', () => {
      setState({appMode: AppMode.CreaturesVTrash, word: 'Spooky'});
      const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
      const noButton = getNoButton(wrapper).render();

      expect(noButton.text().trimLeft()).toEqual('No');
    });

    it('classifies fish on click', () => {
      const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
      getNoButton(wrapper).simulate('click');

      expect(classifyFishStub.withArgs(false).callCount).toEqual(1);
    });

    it('opens bot head on click', () => {
      const wrapper = shallow(<Train {...DEFAULT_PROPS} />);

      expect(wrapper.state().headOpen).toBeFalsy();
      getNoButton(wrapper).simulate('click');
      expect(wrapper.state().headOpen).toBeTruthy();
    });
  });

  describe('train "yes" button', () => {
    const getYesButton = wrapper => wrapper.find('Button').at(1);

    it('displays the current word when not in AppMode.CreaturesVTrash', () => {
      setState({appMode: 'not-creatures-v-trash', word: 'Spooky'});
      const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
      const noButton = getYesButton(wrapper).render();

      expect(noButton.text().trimLeft()).toEqual('Spooky');
    });

    it('displays "yes" in AppMode.CreaturesVTrash', () => {
      setState({appMode: AppMode.CreaturesVTrash, word: 'Spooky'});
      const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
      const noButton = getYesButton(wrapper).render();

      expect(noButton.text().trimLeft()).toEqual('Yes');
    });

    it('classifies fish on click', () => {
      const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
      getYesButton(wrapper).simulate('click');

      expect(classifyFishStub.withArgs(true).callCount).toEqual(1);
    });

    it('opens bot head on click', () => {
      const wrapper = shallow(<Train {...DEFAULT_PROPS} />);

      expect(wrapper.state().headOpen).toBeFalsy();
      getYesButton(wrapper).simulate('click');
      expect(wrapper.state().headOpen).toBeTruthy();
    });
  });

  it('transitions to Modes.Predicting when continue button is clicked', () => {
    const toModeStub = sinon.stub(modeHelpers, 'toMode');
    const wrapper = shallow(<Train {...DEFAULT_PROPS} />);
    const continueButton = wrapper.find('Button').at(2);
    continueButton.simulate('click');

    expect(toModeStub.withArgs(Modes.Predicting).callCount).toEqual(1);

    modeHelpers.toMode.restore();
  });
});

describe('Predict', () => {
  afterEach(() => {
    resetState();
  });

  it('displays media controls when run button is clicked', () => {
    setState({isRunning: false, isPaused: false});
    const wrapper = shallow(<Predict {...DEFAULT_PROPS} />);

    expect(wrapper.exists('#uitest-run-btn')).toBeTruthy();
    expect(wrapper.exists('#uitest-media-ctrl')).toBeFalsy();

    wrapper.find('#uitest-run-btn').simulate('click');

    const newState = getState();
    expect(newState.isRunning).toBeTruthy();
    expect(newState.runStartTime).not.toBeNull();
    expect(wrapper.exists('#uitest-run-btn')).toBeFalsy();
    expect(wrapper.exists('#uitest-media-ctrl')).toBeTruthy();
  });

  it('does not display media controls when run button is clicked in AppMode.CreaturesVTrashDemo', () => {
    setState({
      appMode: AppMode.CreaturesVTrashDemo,
      isRunning: false,
      isPaused: false
    });
    const wrapper = shallow(<Predict {...DEFAULT_PROPS} />);

    expect(wrapper.exists('#uitest-media-ctrl')).toBeFalsy();
    wrapper.find('#uitest-run-btn').simulate('click');
    expect(wrapper.exists('#uitest-media-ctrl')).toBeFalsy();
  });

  it('highlights the selected media control based on state', () => {
    const getCtrl = (wrapper, i) =>
      wrapper.find('#uitest-media-ctrl > span').at(i);
    const getIconName = wrapper =>
      wrapper.find('FontAwesomeIcon').prop('icon').iconName;
    let wrapper = shallow(<Predict {...DEFAULT_PROPS} />);

    // Press play
    wrapper.find('#uitest-run-btn').simulate('click');
    let play = getCtrl(wrapper, 1);
    expect(getIconName(play)).toEqual('pause');
    // Play & pause icons should not be highlighted, even when it's the selected control.
    // Only rewind & fast-forward are highlighted when selected.
    expect(play.prop('style').color).toEqual(colors.white);

    // Press play again to pause
    play.simulate('click');
    play = getCtrl(wrapper, 1);
    expect(getIconName(play)).toEqual('play');
    expect(play.prop('style').color).toEqual(colors.white);

    // Press rewind
    let rewind = getCtrl(wrapper, 0);
    rewind.simulate('click');
    rewind = getCtrl(wrapper, 0);
    expect(rewind.prop('style').color).toEqual(colors.orange);
    expect(rewind.childAt(0).text()).toEqual('x2');

    // Press rewind again to change time scale
    rewind.simulate('click');
    rewind = getCtrl(wrapper, 0);
    expect(rewind.prop('style').color).toEqual(colors.orange);
    expect(rewind.childAt(0).text()).toEqual('');

    // Press fast-forward
    let fastForward = getCtrl(wrapper, 2);
    fastForward.simulate('click');
    fastForward = getCtrl(wrapper, 2);
    expect(fastForward.prop('style').color).toEqual(colors.orange);
    expect(fastForward.childAt(1).text()).toEqual('x2');

    // Press fast-forward again to change time scale
    fastForward.simulate('click');
    fastForward = getCtrl(wrapper, 2);
    expect(fastForward.prop('style').color).toEqual(colors.white);
    expect(fastForward.childAt(1).text()).toEqual('');
  });

  it('displays the continue button based on state', () => {
    setState({isRunning: false, isPaused: false, canSkipPredict: false});
    let wrapper = shallow(<Predict {...DEFAULT_PROPS} />);
    expect(wrapper.exists('#uitest-continue-btn')).toBeFalsy();

    setState({isRunning: true, isPaused: false, canSkipPredict: true});
    wrapper = shallow(<Predict {...DEFAULT_PROPS} />);
    expect(wrapper.exists('#uitest-continue-btn')).toBeTruthy();

    setState({isRunning: false, isPaused: true, canSkipPredict: true});
    wrapper = shallow(<Predict {...DEFAULT_PROPS} />);
    expect(wrapper.exists('#uitest-continue-btn')).toBeTruthy();
  });
});

describe('Pond', () => {
  let playSoundStub;

  beforeEach(() => {
    playSoundStub = sinon.stub(soundLibrary, 'playSound');
  });

  afterEach(() => {
    soundLibrary.playSound.restore();
    resetState();
  });

  it('recall icons toggle fish set on click', () => {
    let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
    let checkIcon = wrapper.find('FontAwesomeIcon').at(0);
    let banIcon = wrapper.find('FontAwesomeIcon').at(1);

    expect(checkIcon.prop('style').backgroundColor).toEqual(colors.green);
    expect(banIcon.prop('style').backgroundColor).toBeFalsy();
    expect(playSoundStub.callCount).toEqual(0);

    banIcon.simulate('click');
    wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
    checkIcon = wrapper.find('FontAwesomeIcon').at(0);
    banIcon = wrapper.find('FontAwesomeIcon').at(1);

    expect(checkIcon.prop('style').backgroundColor).toBeFalsy();
    expect(banIcon.prop('style').backgroundColor).toEqual(colors.red);
    expect(playSoundStub.withArgs('no').callCount).toEqual(1);
  });

  describe('info button', () => {
    it('displays based on state', () => {
      let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      expect(wrapper.exists('#uitest-info-btn')).toBeFalsy();

      setState({
        appMode: AppMode.FishShort,
        pondFish: [{}],
        recallFish: [{}]
      });
      wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      expect(wrapper.exists('#uitest-info-btn')).toBeTruthy();
    });

    it('toggles pond panel on click', () => {
      setState({
        appMode: AppMode.FishShort,
        pondFish: [{}],
        recallFish: [{}],
        pondPanelShowing: false
      });
      let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);

      wrapper.find('#uitest-info-btn').simulate('click');
      expect(getState().pondPanelShowing).toBeTruthy();
      expect(playSoundStub.withArgs('sortyes').callCount).toEqual(1);

      wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      expect(wrapper.exists('PondPanel')).toBeTruthy();

      wrapper.find('#uitest-info-btn').simulate('click');
      expect(getState().pondPanelShowing).toBeFalsy();
      expect(playSoundStub.withArgs('sortno').callCount).toEqual(1);

      wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      expect(wrapper.exists('PondPanel')).toBeFalsy();
    });
  });

  describe('navigation', () => {
    let toModeStub;

    beforeEach(() => {
      toModeStub = sinon.stub(modeHelpers, 'toMode');
    });

    afterEach(() => {
      modeHelpers.toMode.restore();
    });

    it('displays buttons based on canSkipPond state', () => {
      let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      expect(getState().canSkipPond).toBeFalsy();
      expect(wrapper.exists('#uitest-nav-btns')).toBeFalsy();

      setState({canSkipPond: true});
      wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      expect(wrapper.exists('#uitest-nav-btns')).toBeTruthy();
    });

    it('displays different buttons based on appMode state', () => {
      const getBtnText = (btns, i) =>
        btns
          .at(i)
          .render()
          .text();

      setState({canSkipPond: true, appMode: AppMode.FishLong});
      let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);

      let buttons = wrapper.find('#uitest-nav-btns').find('Button');
      expect(buttons.length).toEqual(3);
      expect(getBtnText(buttons, 0)).toEqual('New Word');
      expect(getBtnText(buttons, 1)).toEqual('Finish');
      expect(getBtnText(buttons, 2)).toEqual('Train More');

      setState({appMode: 'not-fish-long'});
      wrapper = shallow(<Pond {...DEFAULT_PROPS} />);

      buttons = wrapper.find('#uitest-nav-btns').find('Button');
      expect(buttons.length).toEqual(2);
      expect(getBtnText(buttons, 0)).toEqual('Continue');
      expect(getBtnText(buttons, 1)).toEqual('Train More');
    });

    it('"new word" button resets training and transitions to Modes.Words', () => {
      const resetTrainingStub = sinon.stub(helpers, 'resetTraining');

      setState({canSkipPond: true, appMode: AppMode.FishLong});
      let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      const newWordBtn = wrapper.find('#uitest-nav-btns Button').at(0);

      newWordBtn.simulate('click');

      const newState = getState();
      expect(newState.pondClickedFish).toBeNull();
      expect(newState.pondPanelShowing).toBeFalsy();
      expect(resetTrainingStub.callCount).toEqual(1);
      expect(toModeStub.withArgs(Modes.Words).callCount).toEqual(1);

      helpers.resetTraining.restore();
    });

    it('"finish" button calls onContinue', () => {
      const onContinueSpy = sinon.spy();
      setState({
        canSkipPond: true,
        appMode: AppMode.FishLong,
        onContinue: onContinueSpy
      });
      let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      const finishBtn = wrapper.find('#uitest-nav-btns Button').at(1);

      finishBtn.simulate('click');
      expect(onContinueSpy.callCount).toEqual(1);
    });

    it('"continue" button calls onContinue', () => {
      const onContinueSpy = sinon.spy();
      setState({
        canSkipPond: true,
        onContinue: onContinueSpy
      });
      let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      const continueBtn = wrapper.find('#uitest-nav-btns Button').at(0);

      continueBtn.simulate('click');
      expect(onContinueSpy.callCount).toEqual(1);
    });

    it('"train more" button transitions to Modes.Training', () => {
      setState({canSkipPond: true});
      let wrapper = shallow(<Pond {...DEFAULT_PROPS} />);
      const trainMoreBtn = wrapper.find('#uitest-nav-btns Button').at(1);

      trainMoreBtn.simulate('click');

      const newState = getState();
      expect(newState.pondClickedFish).toBeNull();
      expect(newState.pondPanelShowing).toBeFalsy();
      expect(toModeStub.withArgs(Modes.Training).callCount).toEqual(1);
    });
  });
});

describe('Guide', () => {
  let currentGuideStub, playSoundStub;

  beforeEach(() => {
    currentGuideStub = sinon.stub(guide, 'getCurrentGuide');
    currentGuideStub.returns({
      id: 'guide-id',
      style: '',
      heading: 'hey, listen!',
      text: 'this is an important message'
    });
    playSoundStub = sinon.stub(soundLibrary, 'playSound');
  });

  afterEach(() => {
    guide.getCurrentGuide.restore();
    soundLibrary.playSound.restore();
  });

  it('sets guideTypingTimer if not already started', () => {
    setState({guideShowing: false, guideTypingTimer: null});
    const wrapper = shallow(<Guide {...DEFAULT_PROPS} />);

    expect(getState().guideTypingTimer).not.toBeNull();
  });

  it('is dismissable', () => {
    const dismissCurrentGuideStub = sinon
      .stub(guide, 'dismissCurrentGuide')
      .returns(true);
    const wrapper = shallow(<Guide {...DEFAULT_PROPS} />);
    const dismissHandler = wrapper.find('#uitest-dismiss-guide');

    dismissHandler.simulate('click');

    expect(dismissCurrentGuideStub.callCount).toEqual(1);
    expect(playSoundStub.withArgs('other').callCount).toEqual(1);

    guide.dismissCurrentGuide.restore();
  });
});
