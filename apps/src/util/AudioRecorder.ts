const PREFERRED_MIME_TYPES = [
  'audio/webm', // Chrome, Edge, Firefox
  'audio/mp4', // Safari 14.1+
];

function getSupportedMimeType(mediaRecorderClass: typeof MediaRecorder) {
  return PREFERRED_MIME_TYPES.find(type =>
    mediaRecorderClass.isTypeSupported(type)
  );
}

enum StartState {
  Started = 'Started',
  Unsupported = 'Unsupported',
  PermissionDenied = 'PermissionDenied',
  UnknownError = 'UnknownError',
}

/**
 * Browser native audio recorder.
 */
export class AudioRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  constructor(
    // For testing only
    private readonly getUserMedia = navigator?.mediaDevices?.getUserMedia,
    private readonly MediaRecorderClass = typeof MediaRecorder !== 'undefined'
      ? MediaRecorder
      : undefined
  ) {}

  get isRecording(): boolean {
    return this.recorder?.state === 'recording';
  }

  canRecord(): boolean {
    return (
      typeof this.MediaRecorderClass !== 'undefined' && !!this.getUserMedia
    );
  }

  /**
   * Requests microphone access and starts recording.
   *
   * @returns StartState corresponding to thåe outcome.
   */
  async start(): Promise<StartState> {
    if (!this.canRecord()) {
      return StartState.Unsupported;
    }

    try {
      this.stream = await this.getUserMedia({audio: true});
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotAllowedError') {
        return StartState.PermissionDenied;
      }
      console.error('Unexpected error while requesting microphone access', e);
      return StartState.UnknownError;
    }

    const mimeType = getSupportedMimeType(this.MediaRecorderClass!);
    this.chunks = [];

    this.recorder = new this.MediaRecorderClass!(this.stream, {mimeType});
    this.recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
    this.recorder.start();
    return StartState.Started;
  }

  /**
   * Stops recording and returns the recorded data.
   */
  async stop(): Promise<Blob> {
    if (!this.recorder) {
      throw new Error('AudioRecorder: call start() before stop()');
    }

    await new Promise<void>(resolve => {
      this.recorder!.onstop = () => resolve();
      this.recorder!.stop();
    });

    const blob = new Blob(this.chunks);
    this.release();
    return blob;
  }

  cancel(): void {
    if (!this.recorder) {
      return;
    }
    this.recorder.ondataavailable = null;
    this.recorder.stop();
    this.release();
  }

  private release(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
  }
}
