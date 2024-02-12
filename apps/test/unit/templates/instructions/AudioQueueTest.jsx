import React from 'react';
import {render} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import {setExternalGlobals} from '../../../util/testUtils';
import {UnconnectedInlineAudio as InlineAudio} from '@cdo/apps/templates/instructions/InlineAudio';
import {AudioQueueContext} from '@cdo/apps/templates/instructions/AudioQueue';
import sinon from 'sinon';
import {playNextAudio} from '@cdo/apps/templates/utils/audioQueueUtils';

const DEFAULT_PROPS = {
  assetUrl: () => {},
  isK1: true,
  locale: 'it_it',
  src: 'test',
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
  it('calls addToQueue for each InlineAudio rendered', () => {
    const addToQueueSpy = sinon.spy();
    render(
      <AudioQueueContext.Provider
        value={{
          setAudioQueue: addToQueueSpy,
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
          setAudioQueue: addToQueueSpy,
        }}
      >
        <InlineAudio {...DEFAULT_PROPS} ttsAutoplayEnabled={false} />
      </AudioQueueContext.Provider>
    );
    expect(addToQueueSpy).to.not.have.been.called;
  });

  it('playNextAudio plays the next audio if the queue is not empty and not already playing', () => {
    const playAudioMock = sinon.spy();
    const audioQueueMock = [{playAudio: playAudioMock}];
    const isPlayingMock = {current: false};

    playNextAudio(audioQueueMock, isPlayingMock);
    expect(playAudioMock).to.have.been.called;
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
