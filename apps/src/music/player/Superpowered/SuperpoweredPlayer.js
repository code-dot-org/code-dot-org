import {SuperpoweredGlue, SuperpoweredWebAudio} from '@superpoweredsdk/web';

const minimumSampleRate = 44100;
const playerProcessorUrl = '/blockly/media/music/PlayerProcessor.js';
//const downloadProcessorUrl = '/blockly/media/music/DownloadProcessor.js';

class PlaybackManager {
  async setup() {
    this.superpowered = await SuperpoweredGlue.Instantiate(
      'ExampleLicenseKey-WillExpire-OnNextUpdate'
    );
    this.webaudioManager = new SuperpoweredWebAudio(
      minimumSampleRate,
      this.superpowered
    );

    this.playerNodes = {};
    this.buffers = {};
    this.urlToPath = {};
  }

  async setupTrack(path, url) {
    if (this.playerNodes[path]) {
      return;
    }
    const processorNode = await this.webaudioManager.createAudioNodeAsync(
      playerProcessorUrl,
      'PlayerProcessor',
      this.onMessageProcessorAudioScope.bind(this)
    );

    processorNode.onprocessorerror = e => {
      console.error(e);
    };

    // const downloadNode = await this.webaudioManager.createAudioNodeAsync(
    //   downloadProcessorUrl,
    //   'DownloadProcessor',
    //   this.onMessageProcessorAudioScope.bind(this)
    // );

    // Connect the AudioWorkletNode to the WebAudio destination (main audio output by default, such as your speakers).
    processorNode.connect(this.webaudioManager.audioContext.destination);

    this.urlToPath[url] = path;
    this.superpowered.downloadAndDecode(url, processorNode);

    this.playerNodes[path] = processorNode;
  }

  getPlayerNode(path) {
    return this.playerNodes[path];
  }

  onMessageProcessorAudioScope(message) {
    if (message.event === 'ready') {
      console.log(message);
      // The processor node is now loaded
    }
    if (message.event === 'assetLoaded') {
      console.log(message);
      // this.buffers[this.urlToPath[message.data.url]] = message.data.buffer;
    }
  }

  start() {
    this.webaudioManager.audioContext.resume();
  }

  stop() {
    Object.values(this.playerNodes).forEach(node => {
      node.sendMessageToAudioScope({type: 'pause'});
    });
    // this.webaudioManager.audioContext.suspend();
    // this.playerNodes.forEach(node => {
    //   node.disconnect();
    //   node.destruct();
    // });
    // this.playerNodes = [];
  }

  async scheduleTrack(path, when, playbackRate, pitchShift) {
    // const playerNode = await this.webaudioManager.createAudioNodeAsync(
    //   playerProcessorUrl,
    //   'PlayerProcessor',
    //   this.onMessageProcessorAudioScope.bind(this)
    // );

    // playerNode.onprocessorerror = e => {
    //   console.error(e);
    // };

    // // Connect the AudioWorkletNode to the WebAudio destination (main audio output by default, such as your speakers).
    // playerNode.connect(this.webaudioManager.audioContext.destination);
    // playerNode.sendMessageToAudioScope({
    //   type: 'playBufferSynchronized',
    //   payload: {
    //     position: when * -1.0,
    //     playbackRate,
    //     pitchShift,
    //     buffer: this.buffers[path],
    //   },
    // });
    // this.playerNodes.push(playerNode);
    if (!this.playerNodes[path]) {
      return;
    }
    this.playerNodes[path].sendMessageToAudioScope({
      type: 'playSynchronized',
      payload: {
        position: when * -1.0,
        playbackRate,
        pitchShift: path.includes('beats') ? 0 : pitchShift,
      },
    });
  }
}

export default PlaybackManager;
