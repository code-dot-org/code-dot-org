import {render} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  AudioQueue,
  AudioQueueContext,
} from '@cdo/apps/templates/instructions/AudioQueue';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {setExternalGlobals} from '../../../util/testUtils';

interface QueueContext {
  addToQueue: (audioItem: object) => void;
  playNextAudio: () => void;
}

type myProps = {
  shouldQueue: boolean;
  playNextAudioCallCounter: number;
};

class AudioQueueItem extends React.Component<myProps> {
  componentDidMount() {
    const {addToQueue, playNextAudio} = this.context as QueueContext;
    if (this.props.shouldQueue) addToQueue(this);
    for (let i = 0; i < this.props.playNextAudioCallCounter; i++)
      playNextAudio();
  }

  playAudio() {}
  render() {
    return <div />;
  }
}

AudioQueueItem.contextType = AudioQueueContext;

describe('AudioQueue', () => {
  setExternalGlobals();
  let playAudioSpy: sinon.SinonSpy;
  beforeEach(() => {
    playAudioSpy = sinon.spy(AudioQueueItem.prototype, 'playAudio');
  });

  afterEach(() => {
    playAudioSpy.restore();
  });

  // Write react component that expects to be provided that function, test does nothing when queue is empty, playAudio calls playAudio of child component
  it('does not play audio when nothing added to queue', () => {
    render(
      <AudioQueue>
        <AudioQueueItem shouldQueue={false} playNextAudioCallCounter={1} />
      </AudioQueue>
    );

    expect(playAudioSpy).to.not.have.been.called;
  });

  it('plays audio when adding to queue', () => {
    render(
      <AudioQueue>
        <AudioQueueItem shouldQueue={true} playNextAudioCallCounter={1} />
      </AudioQueue>
    );

    expect(playAudioSpy).to.have.been.called;
  });

  it('only plays one audio if one audio in queue and multiple playNextAudio calls', () => {
    render(
      <AudioQueue>
        <AudioQueueItem shouldQueue={true} playNextAudioCallCounter={2} />
      </AudioQueue>
    );

    expect(playAudioSpy).to.have.been.calledOnce;
  });
});
