import React from 'react';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';

import {setExternalGlobals} from '../../../util/testUtils';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedInlineAudio as InlineAudio} from '@cdo/apps/templates/instructions/InlineAudio';
import {AudioQueue} from '@cdo/apps/templates/instructions/AudioQueue';

const DEFAULT_PROPS = {
  assetUrl: () => {},
  isK1: true,
  locale: 'it_it',
  src: 'test_source',
  textToSpeechEnabled: true,
  style: {
    button: {},
    buttonImg: {},
  },
  ttsAutoplayEnabled: true,
};

describe('AudioQueue', () => {
  setExternalGlobals();

  let windowAudio;
  beforeEach(() => {
    windowAudio = window.Audio;
    window.Audio = FakeAudio;
  });

  afterEach(() => {
    window.Audio = windowAudio;
  });

  it('plays the next audio item in the queue', () => {
    const wrapper = mount(
      <AudioQueue>
        <InlineAudio {...DEFAULT_PROPS} />
        <InlineAudio {...DEFAULT_PROPS} />
      </AudioQueue>
    );
    console.log(wrapper.debug());

    const audioQueueInstance = wrapper.at(0).find(AudioQueue).instance();

    const inlineAudioInstance = wrapper.find('InlineAudio').at(0).instance();

    act(() => {
      audioQueueInstance.addToQueue(inlineAudioInstance);
    });

    const queueState = audioQueueInstance.state.audioQueue;

    expect(queueState).toHaveLength(1);
    expect(queueState[0]).toBe(inlineAudioInstance);

    act(() => {
      audioQueueInstance.playNextAudio();
    });

    expect(inlineAudioInstance.playAudio).toHaveBeenCalled();

    wrapper.unmount();
  });
});

class FakeAudio {
  play() {
    return Promise.resolve();
  }
  pause() {}
  load() {}
  // EventTarget interface
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {}
  removeAttribute() {}
}
