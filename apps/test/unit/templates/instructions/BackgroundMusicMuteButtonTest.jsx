import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedBackgroundMusicMuteButton as BackgroundMusicMuteButton} from '@cdo/apps/templates/instructions/BackgroundMusicMuteButton';
import {PaneButton} from '@cdo/apps/templates/PaneHeader';
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

  // The component passes its `className` prop through to PaneButton as the
  // button's DOM id, so match the rendered <button> rather than the class.
  const muteButton = wrapper => wrapper.find('button#uitest-mute-music-button');

  let server;
  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondWith('POST', '/api/v1/users/me/mute_music', 'ok');
  });

  afterEach(() => server.restore());

  it('switches label and icon when button is pressed', () => {
    const wrapper = setUp();
    assert(wrapper.text() === i18n.backgroundMusicOn());
    muteButton(wrapper).simulate('click');
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
      muteButton(wrapper).simulate('click');
    });
    await act(async () => {
      server.respond();
    });
    wrapper.update();
    expect(onMuteSpy).to.have.been.calledOnce;
    await act(async () => {
      muteButton(wrapper).simulate('click');
    });
    wrapper.update();
    expect(onUnmuteSpy).to.have.been.calledOnce;
  });

  describe('minecraft styling', () => {
    it('passes isMinecraft through to the PaneButton', () => {
      const wrapper = setUp({
        isMinecraft: true,
      });
      expect(wrapper.find(PaneButton).props().isMinecraft).to.be.true;
    });
  });
});
