import {experimental_transcribe as transcribe} from 'ai';

import {getTranscriptionModel} from '../helpers/modelHelpers';

export class AITranscriber {
  constructor(
    private recorder: MediaRecorder | null = null,
    private stream: MediaStream | null = null,
    private chunks: Blob[] = []
  ) {}

  public isRecording = false;

  async start() {
    if (this.isRecording) {
      console.error('Already recording');
      return;
    }
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({audio: true});
    this.recorder = new MediaRecorder(this.stream);
    this.recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
    this.recorder.start();
    this.isRecording = true;
  }

  cancel() {
    if (!this.isRecording) {
      return;
    }
    this.isRecording = false;
    this.recorder?.stop();
    this.releaseStream();
  }

  async endAndTranscribe(): Promise<string> {
    if (!this.isRecording) {
      throw new Error('Not recording');
    }

    await new Promise<void>((resolve, reject) => {
      this.recorder!.onstop = () => resolve();
      this.recorder!.onerror = () => reject(new Error('MediaRecorder error'));
      this.recorder!.stop();
    });

    this.releaseStream();

    const audioBuffer = await new Blob(this.chunks).arrayBuffer();
    const result = await transcribe({
      model: getTranscriptionModel(),
      audio: audioBuffer,
    });

    this.isRecording = false;
    return result.text;
  }

  private releaseStream(): void {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
  }
}
