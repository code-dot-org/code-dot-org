import {AudioRecorder} from '@cdo/apps/util/AudioRecorder';

interface MockMediaRecorder {
  ondataavailable: ((event: BlobEvent) => void) | null;
  onstop: (() => void) | null;
  start: jest.Mock;
  stop: jest.Mock;
  state: RecordingState;
}

const mimeType = 'audio/webm';

describe('AudioRecorder', () => {
  let mediaRecorder: MockMediaRecorder;
  let MediaRecorderClass: typeof MediaRecorder;
  let getUserMedia: jest.Mock;
  let stream: MediaStream;
  let track: MediaStreamTrack;
  let audioRecorder: AudioRecorder;
  let unsupportedRecorder: AudioRecorder;

  beforeEach(() => {
    track = {stop: jest.fn()} as unknown as MediaStreamTrack;
    stream = {
      getTracks: jest.fn(() => [track]),
    } as unknown as MediaStream;

    getUserMedia = jest.fn().mockResolvedValue(stream);

    mediaRecorder = {
      ondataavailable: null,
      onstop: null,
      start: jest.fn(),
      stop: jest.fn().mockImplementation(() => {
        mediaRecorder.onstop?.();
        mediaRecorder.state = 'inactive';
      }),
      state: 'inactive',
    };

    MediaRecorderClass = jest.fn(
      () => mediaRecorder
    ) as unknown as typeof MediaRecorder;

    MediaRecorderClass.isTypeSupported = jest.fn(
      (type: string) => type === mimeType
    );

    audioRecorder = new AudioRecorder(getUserMedia, MediaRecorderClass);
    unsupportedRecorder = new AudioRecorder(undefined, undefined);
  });

  describe('canRecord()', () => {
    it('returns true when both getUserMedia and MediaRecorder are defined', () => {
      expect(audioRecorder.canRecord()).toBe(true);
    });

    it('returns false when getUserMedia is not available', () => {
      expect(unsupportedRecorder.canRecord()).toBe(false);
    });
  });

  describe('isRecording', () => {
    it('returns false before start() is called', () => {
      expect(audioRecorder.isRecording).toBe(false);
    });

    it('returns true when the underlying recorder is in recording state', async () => {
      await audioRecorder.start();
      mediaRecorder.state = 'recording';
      expect(audioRecorder.isRecording).toBe(true);
    });

    it('returns false when the underlying recorder is inactive', async () => {
      await audioRecorder.start();
      mediaRecorder.state = 'inactive';
      expect(audioRecorder.isRecording).toBe(false);
    });
  });

  describe('start()', () => {
    it('returns "Started", initializes stream, and starts recorder on success', async () => {
      const result = await audioRecorder.start();

      expect(getUserMedia).toHaveBeenCalledWith({audio: true});
      expect(MediaRecorderClass).toHaveBeenCalledWith(stream, {
        mimeType,
      });
      expect(mediaRecorder.ondataavailable).toBeDefined();
      expect(mediaRecorder.start).toHaveBeenCalled();
      expect(result).toBe('Started');
    });

    it('returns "Unsupported" when canRecord() is false', async () => {
      const result = await unsupportedRecorder.start();
      expect(result).toBe('Unsupported');
      expect(getUserMedia).not.toHaveBeenCalled();
    });

    it('returns "PermissionDenied" when getUserMedia throws NotAllowedError', async () => {
      getUserMedia.mockRejectedValue(
        new DOMException('Permission denied', 'NotAllowedError')
      );
      const result = await audioRecorder.start();
      expect(result).toBe('PermissionDenied');
    });

    it('returns "UnknownError" when getUserMedia throws an unexpected error', async () => {
      getUserMedia.mockRejectedValue(new Error('unknown'));
      const result = await audioRecorder.start();
      expect(result).toBe('UnknownError');
    });

    it('collects chunks from ondataavailable events', async () => {
      await audioRecorder.start();
      const blob1 = new Blob(['a']);
      const blob2 = new Blob(['b']);
      mediaRecorder.ondataavailable?.({data: blob1} as BlobEvent);
      mediaRecorder.ondataavailable?.({data: blob2} as BlobEvent);
      const result = await audioRecorder.stop();
      expect(result.size).toBe(blob1.size + blob2.size);
    });

    it('ignores zero-size chunks in ondataavailable', async () => {
      await audioRecorder.start();
      mediaRecorder.ondataavailable?.({
        data: new Blob([]),
      } as BlobEvent);
      const result = await audioRecorder.stop();
      expect(result.size).toBe(0);
    });
  });

  describe('stop()', () => {
    it('throws when called before start()', async () => {
      await expect(audioRecorder.stop()).rejects.toThrow();
    });

    it('resolves with a Blob after recording', async () => {
      await audioRecorder.start();
      const blob = new Blob(['a']);
      mediaRecorder.ondataavailable?.({data: blob} as BlobEvent);

      const result = await audioRecorder.stop();
      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBe(blob.size);
    });

    it('stops all media stream tracks', async () => {
      await audioRecorder.start();
      mediaRecorder.state = 'recording';

      await audioRecorder.stop();
      expect(track.stop).toHaveBeenCalled();
      expect(audioRecorder.isRecording).toBe(false);
    });
  });

  describe('cancel()', () => {
    it('does nothing when called before start()', () => {
      expect(() => audioRecorder.cancel()).not.toThrow();
    });

    it('stops the recorder and releases all resources', async () => {
      await audioRecorder.start();
      audioRecorder.cancel();

      expect(mediaRecorder.stop).toHaveBeenCalled();
      expect(mediaRecorder.ondataavailable).toBeNull();
      expect(track.stop).toHaveBeenCalled();
      expect(audioRecorder.isRecording).toBe(false);
    });
  });
});
