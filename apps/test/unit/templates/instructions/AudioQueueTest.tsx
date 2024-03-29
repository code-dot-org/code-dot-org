import {render} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import {AudioQueueContext} from '@cdo/apps/templates/instructions/AudioQueue';
import {UnconnectedInlineAudio as InlineAudio} from '@cdo/apps/templates/instructions/InlineAudio';

import {expect} from '../../../util/reconfiguredChai';
import {setExternalGlobals} from '../../../util/testUtils';

interface InlineAudioProps {
  assetUrl: () => void;
  isK1: boolean;
  locale: string;
  src: string;
  textToSpeechEnabled: boolean;
  ttsAutoplayEnabled: boolean;
}

const DEFAULT_PROPS: InlineAudioProps = {
  assetUrl: () => {},
  isK1: true,
  locale: 'it_it',
  src: 'test',
  textToSpeechEnabled: true,
  ttsAutoplayEnabled: true,
};

describe('AudioQueue', () => {
  setExternalGlobals();

  let windowAudio: typeof Audio;

  beforeEach(() => {
    windowAudio = window.Audio;
  });

  afterEach(() => {
    window.Audio = windowAudio;
  });

  it('calls addToQueue for each InlineAudio rendered', () => {
    const addToQueueSpy = sinon.spy();
    render(
      <AudioQueueContext.Provider
        value={{
          addToQueue: addToQueueSpy,
          playNextAudio: () => {},
          clearQueue: () => {},
          isPlaying: {current: false},
        }}
      >
        <InlineAudio {...DEFAULT_PROPS} />
        <InlineAudio {...DEFAULT_PROPS} />
      </AudioQueueContext.Provider>
    );
    expect(addToQueueSpy).to.have.been.calledTwice;
  });

  it('does not add to queue if autoplay is off', () => {
    const addToQueueSpy = sinon.spy();
    render(
      <AudioQueueContext.Provider
        value={{
          addToQueue: addToQueueSpy,
          playNextAudio: () => {},
          clearQueue: () => {},
          isPlaying: {current: false},
        }}
      >
        <InlineAudio {...DEFAULT_PROPS} ttsAutoplayEnabled={false} />
      </AudioQueueContext.Provider>
    );
    expect(addToQueueSpy).to.not.have.been.called;
  });

  it('playNextAudio plays the next audio if the queue is not empty and not already playing', () => {
    // comment
  });
});

// class FakeAudio {
//   play() {
//     return Promise.resolve();
//   }
//   pause() {}
//   load() {}
//   // EventTarget interface
//   addEventListener() {}
//   removeEventListener() {}
//   dispatchEvent() {}
//   removeAttribute() {}
// }
