import React from 'react';
import {mount} from 'enzyme';
import {expect, assert} from '../../../util/reconfiguredChai';
import {UnconnectedBackgroundMusicMuteButton as BackgroundMusicMuteButton} from '@cdo/apps/templates/instructions/BackgroundMusicMuteButton';
import sinon from 'sinon';
import i18n from '@cdo/locale';

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
  const setUp = (overrideProps = {}) => {
    const props = {...DEFAULT_PROPS, ...overrideProps};
    return mount(<BackgroundMusicMuteButton {...props} />);
  };

  it('switches label and icon when button is pressed', () => {
    const wrapper = setUp();
    assert(wrapper.text() === i18n.backgroundMusicOn());
    wrapper.find('.uitest-mute-music-button').simulate('click');
    assert(wrapper.text() === i18n.backgroundMusicOff());
  });

  it('calls mute and unmute functions accordingly', () => {
    let onMuteSpy = sinon.spy();
    let onUnmuteSpy = sinon.spy();
    const wrapper = setUp({
      muteBackgroundMusic: onMuteSpy,
      unmuteBackgroundMusic: onUnmuteSpy
    });
    wrapper.find('.uitest-mute-music-button').simulate('click');
    expect(onMuteSpy).to.have.been.calledOnce;
    wrapper.find('.uitest-mute-music-button').simulate('click');
    expect(onUnmuteSpy).to.have.been.calledOnce;
  });

  describe('minecraft vs starwars styling', () => {
    it('uses starwars styling if isMinecraft is false', () => {
      const wrapper = setUp({
        isMinecraft: false
      });
      expect(
        wrapper
          .find('#uitest-mute-music-button')
          .at(0)
          .props().style.color
      ).to.equal('rgb(118, 101, 160)');
    });

    it('uses minecraft styling if isMinecraft is true', () => {
      const wrapper = setUp({
        isMinecraft: true
      });
      expect(
        wrapper
          .find('#uitest-mute-music-button')
          .at(0)
          .props().isMinecraft
      ).to.be.true;
    });
  });
});
