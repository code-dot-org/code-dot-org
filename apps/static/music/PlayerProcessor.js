// Import the superpowered library from the CDN if evaluating
// import 'https://cdn.jsdelivr.net/npm/@superpoweredsdk/web@2.6.6/dist/superpowered-npm.wasm';
// import 'https://cdn.jsdelivr.net/npm/@superpoweredsdk/web@2.6.6/dist/Superpowered.js';

// Or from your own location if in production eg
import './Superpowered.js';

// eslint-disable-next-line no-undef
class PlayerProcessor extends SuperpoweredWebAudio.AudioWorkletProcessor {
  // Runs after the constructor.
  onReady() {
    this.player = new this.Superpowered.AdvancedAudioPlayer(
      this.samplerate,
      2,
      2,
      0,
      0.501,
      2,
      false
    );

    this.player.timeStretchingSound = 2;
    this.playerGain = 1;

    // Notify the main scope that we're prepared.
    this.sendMessageToMainScope({event: 'ready'});
  }

  // onDestruct is called when the parent AudioWorkletNode.destruct() method is called.
  // You should clear up all Superpowered objects and allocated buffers here.
  onDestruct() {
    if (this.player) {
      this.player.destruct();
    }
  }

  processAudio(inputBuffer, outputBuffer, buffersize, parameters) {
    // Ensure the samplerate is in sync on every audio processing callback.
    this.player.outputSamplerate = this.samplerate;

    // Render into the output buffer.
    if (
      !this.player.processStereo(
        outputBuffer.pointer,
        false,
        buffersize,
        this.playerGain
      )
    ) {
      // If no player output, set output to 0s.
      this.Superpowered.memorySet(outputBuffer.pointer, 0, buffersize * 8); // 8 bytes for each frame (1 channel is 4 bytes, two channels)
    }
  }

  // Messages are received from the main scope through this method.
  onMessageFromMainScope(message) {
    if (message.type === 'parameterChange') {
      if (message.payload.id === 'localPlayerVolume')
        this.playerGain = message.payload.value;
      else if (message.payload.id === 'localPlayerRate')
        this.player.playbackRate = message.payload.value;
      else if (message.payload.id === 'localPlayerPitch')
        this.player.pitchShiftCents = message.payload.value;
    }

    if (message.type === 'playSynchronized') {
      // this.player.pause();
      // this.sampleLoaded = true;
      // this.player.openMemory(
      //   this.Superpowered.arrayBufferToWASM(message.payload.buffer),
      //   false,
      //   false
      // );
      // this.player.seek(0);

      // const offset = 100;

      this.player.firstBeatMs = 0;
      this.player.playbackRate = message.payload.playbackRate || 1;
      this.player.pitchShiftCents = message.payload.pitchShift || 0;
      console.log('Play synchronized to position: ' + message.payload.position);
      this.player.playSynchronizedToPosition(message.payload.position);
    }

    if (message.type === 'pause') {
      this.player.pause();
    }

    if (message.SuperpoweredLoaded) {
      this.player.pause();
      this.sampleLoaded = true;
      this.player.openMemory(
        this.Superpowered.arrayBufferToWASM(message.SuperpoweredLoaded.buffer),
        false,
        false
      );
      this.player.seek(0);
      this.sendMessageToMainScope({event: 'assetLoaded'});
    }
  }
}

// The following code registers the processor script for the browser, note the label and reference.
if (typeof AudioWorkletProcessor !== 'undefined')
  registerProcessor('PlayerProcessor', PlayerProcessor);
export default PlayerProcessor;
