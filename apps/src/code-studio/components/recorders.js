import Recorder from 'recorder-js';
import vmsg from 'vmsg';

class Mp3Recorder {
  constructor() {
    this.recorder = new vmsg.Recorder({wasmURL: '/shared/wasm/vmsg.wasm'});
  }

  init = async stream => {
    await this.recorder.initAudio();
    await this.recorder.initWorker();
  };

  startRecording = async () => {
    this.recorder.startRecording();
  };

  stopRecording = async () => {
    const blob = await this.recorder.stopRecording();
    return blob;
  };

  isRecording = () => {
    return !!this.recorder.blob;
  };

  getExtension = () => {
    return RecordingFileType.MP3;
  };
}

class WavRecorder {
  constructor() {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.recorder = new Recorder(audioContext);
    this.recording = false;
    this.stream = null;
  }

  init = async stream => {
    this.stream = stream;
    await this.recorder.init(stream);
  };

  startRecording = async () => {
    await this.recorder.start();
    this.recording = true;
  };

  stopRecording = async () => {
    const {blob} = await this.recorder.stop();
    this.recording = false;
    this.stream.getTracks().forEach(track => track.stop());
    return blob;
  };

  isRecording = () => {
    return this.recording;
  };

  getExtension = () => {
    return RecordingFileType.WAV;
  };
}

export const RecordingFileType = {
  MP3: '.mp3',
  WAV: '.wav',
};

const getRecorder = extension => {
  if (extension === RecordingFileType.WAV) {
    return new WavRecorder();
  }

  return new Mp3Recorder();
};

export default getRecorder;
