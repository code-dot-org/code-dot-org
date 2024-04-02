import {render} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import {
  AudioQueue,
  AudioQueueContext,
} from '@cdo/apps/templates/instructions/AudioQueue';

import {expect} from '../../../util/reconfiguredChai';
import {setExternalGlobals} from '../../../util/testUtils';

type myProps = {
  shouldQueue: boolean;
  playNextAudioCallCounter: number;
};

class AudioQueueItem extends React.Component<myProps> {
  componentDidMount() {
    const {addToQueue, playNextAudio} = this.context;
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

  // Write react component that expects to be provided that function, test does nothing when queue is empty, playAudio calls playAudio of child component
  it('does not play audio when nothing added to queue', () => {
    const playAudioSpy = sinon.spy(AudioQueueItem.prototype, 'playAudio');

    render(
      <AudioQueue>
        <AudioQueueItem shouldQueue={false} playNextAudioCallCounter={1} />
      </AudioQueue>
    );

    expect(playAudioSpy).to.not.have.been.called;
    playAudioSpy.restore();
  });

  it('plays audio when adding to queue', () => {
    const playAudioSpy = sinon.spy(AudioQueueItem.prototype, 'playAudio');

    render(
      <AudioQueue>
        <AudioQueueItem shouldQueue={true} playNextAudioCallCounter={1} />
      </AudioQueue>
    );

    expect(playAudioSpy).to.have.been.called;
    playAudioSpy.restore();
  });

  it('only plays one audio if one audio in queue and multiple plaYNextAudio calls', () => {
    const playAudioSpy = sinon.spy(AudioQueueItem.prototype, 'playAudio');

    render(
      <AudioQueue>
        <AudioQueueItem shouldQueue={true} playNextAudioCallCounter={2} />
      </AudioQueue>
    );

    expect(playAudioSpy).to.have.been.calledOnce;
    playAudioSpy.restore();
  });
});
