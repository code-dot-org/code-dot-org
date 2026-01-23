import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedBackgroundMusicMuteButton as BackgroundMusicMuteButton} from '@cdo/apps/templates/instructions/BackgroundMusicMuteButton';
import i18n from '@cdo/locale';

import {expect, assert} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  teacherOnly: false,
  className: 'uitest-mute-music-button',
  signedIn: true,
  isMinecraft: false,
  isRtl: false,
  currentUserBackgroundMusicMuted: false,
  setMuteMusic: () => {},
  muteBackgroundMusic: () => {},
  unmuteBackgroundMusic: () => {},
};

describe('SignedInUser', () => {
  const setUp = (overrideProps = {}) => {
    const props = {...DEFAULT_PROPS, ...overrideProps};
    return mount(<BackgroundMusicMuteButton {...props} />);
  };

  let server;
  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondWith('POST', '/api/v1/users/me/mute_music', 'ok');
  });

  afterEach(() => server.restore());

  it('switches label and icon when button is pressed', async () => {
    const wrapper = setUp();
    assert(wrapper.text() === i18n.backgroundMusicOn());
    await act(async () => {
      wrapper.find('.uitest-mute-music-button').simulate('click');
    });
    wrapper.update();
    assert(wrapper.text() === i18n.backgroundMusicOff());
  });

  it('calls mute and unmute functions accordingly', async () => {
    let onMuteSpy = sinon.spy();
    let onUnmuteSpy = sinon.spy();
    const wrapper = setUp({
      muteBackgroundMusic: onMuteSpy,
      unmuteBackgroundMusic: onUnmuteSpy,
    });
    await act(async () => {
      wrapper.find('.uitest-mute-music-button').simulate('click');
    });
    await act(async () => {
      server.respond();
    });
    wrapper.update();
    expect(onMuteSpy).to.have.been.calledOnce;
    await act(async () => {
      wrapper.find('.uitest-mute-music-button').simulate('click');
    });
    wrapper.update();
    expect(onUnmuteSpy).to.have.been.calledOnce;
  });

  describe('minecraft vs starwars styling', () => {
    it('uses starwars styling if isMinecraft is false', () => {
      const wrapper = setUp({
        isMinecraft: false,
      });
      expect(
        wrapper.find('#uitest-mute-music-button').at(0).props().style.color
      ).to.equal('rgb(118, 101, 160)');
    });

    it('uses minecraft styling if isMinecraft is true', () => {
      const wrapper = setUp({
        isMinecraft: true,
      });
      expect(
        wrapper.find('#uitest-mute-music-button').at(0).props().isMinecraft
      ).to.be.true;
    });
  });
});
