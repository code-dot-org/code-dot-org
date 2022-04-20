import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import BackgroundMusicMuteButton from '@cdo/apps/templates/instructions/BackgroundMusicMuteButton';
import sinon from 'sinon';
import i18n from '@cdo/locale';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import instructions from '@cdo/apps/redux/instructions';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';

const DEFAULT_PROPS = {
  teacherOnly: false,
  className: 'uitest-mute-music-button',
  signedIn: true,
  isMinecraft: false,
  isRtl: false,
  currentUserBackgroundMusicMuted: false,
  setMuteMusic: () => {},
  muteBackgroundMusic: () => {},
  unmuteBackgroundMusic: () => {}
};

describe('SignedInUser', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({currentUser, instructions});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  const setUp = (overrideProps = {}) => {
    const props = {...DEFAULT_PROPS, ...overrideProps};
    return mount(
      <Provider store={store}>
        <BackgroundMusicMuteButton {...props} />
      </Provider>
    );
  };

  it('switches label and icon when button is pressed', () => {
    const wrapper = setUp();
    console.log(wrapper.debug());
    expect(
      wrapper.find('.uitest-mute-music-button').to.contain('.fa fa-music')
    );
    expect(
      wrapper
        .find('.uitest-mute-music-button')
        .to.contain(i18n.backgroundMusicOn())
    );
    wrapper
      .find('.uitest-mute-music-button')
      .at(1)
      .simulate('click');
    expect(wrapper.find('.fa fa-volume-off')).to.have.length(1);
    expect(
      wrapper
        .find('.uitest-mute-music-button')
        .to.contain(i18n.backgroundMusicOff())
    );
  });

  it('calls mute and unmute functions accordingly', () => {
    let onMuteSpy = sinon.spy();
    let onUnmuteSpy = sinon.spy();
    const wrapper = setUp({
      muteBackgroundMusic: onMuteSpy,
      unmuteBackgroundMusic: onUnmuteSpy
    });
    wrapper
      .find('.uitest-mute-music-button')
      .at(1)
      .simulate('click');
    expect(onMuteSpy).to.have.been.calledOnce;
    wrapper
      .find('.uitest-mute-music-button')
      .at(1)
      .simulate('click');
    expect(onUnmuteSpy).to.have.been.calledOnce;
  });

  describe('minecraft vs starwars styling', () => {
    it('uses starwars styling if isMinecraft is false', () => {
      const wrapper = setUp({
        isMinecraft: false
      });
      expect(
        wrapper
          .find('.uitest-mute-music-button')
          .at(1)
          .props().style
      ).to.contain({
        color: 'rgb(118, 101, 160)'
      });
    });

    it('uses minecraft styling if isMinecraft is true', () => {
      const wrapper = setUp({
        isMinecraft: true
      });
      expect(
        wrapper
          .find('.uitest-mute-music-button')
          .at(1)
          .props().style
      ).to.contain({color: 'rgb(191, 191, 191)'});
    });
  });
});
