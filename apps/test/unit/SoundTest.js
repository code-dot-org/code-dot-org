import {expect} from '../util/reconfiguredChai';
import Sound from '@cdo/apps/Sound';

describe('Sound', () => {
  let sound;

  describe('play method', () => {
    beforeEach(() => {
      sound = new Sound({});
    });

    it('calls handlePlayFailed when there is no method to play audio', () => {
      expect(sound.audioElement).to.be.null;
      expect(sound.reusableBuffer).to.be.null;
      jest.spyOn(sound, 'handlePlayFailed').mockClear().mockImplementation();
      sound.play();
      expect(sound.handlePlayFailed).to.have.been.calledOnce;
      jest.restoreAllMocks();
    });

    it('uses the reusable audio buffer when available', () => {
      let fakeStartMethod = sinon.fake();
      sound.reusableBuffer = sinon.fake();
      jest.spyOn(sound, 'newPlayableBufferSource').mockClear()
        .mockReturnValue({start: fakeStartMethod});
      sound.play();
      expect(sound.newPlayableBufferSource).to.have.been.calledOnce;
      expect(sound.playableBuffers).to.have.length(1);
      expect(fakeStartMethod).to.have.been.calledOnce;
      jest.restoreAllMocks();
    });

    it('uses HTML5 audio when there is no reusable audio buffer', () => {
      sound.audioElement = {
        addEventListener: sinon.fake(),
        removeEventListener: sinon.fake(),
        play: sinon.fake(),
      };
      expect(sound.reusableBuffer).to.be.null;
      sound.play();
      expect(sound.audioElement.play).to.have.been.calledOnce;
      jest.restoreAllMocks();
    });
  });

  describe('playAfterLoad method', () => {
    it('sets config.playAfterLoad to true', () => {
      sound = new Sound({playAfterLoad: false});
      expect(sound.config.playAfterLoad).to.be.false;
      sound.playAfterLoad();
      expect(sound.config.playAfterLoad).to.be.true;
    });
  });

  describe('handlePlayFailed method', () => {
    it('calls callback', () => {
      let fakeCallback = sinon.fake();
      sound = new Sound({});
      sound.handlePlayFailed({callback: fakeCallback});
      expect(fakeCallback).to.have.been.calledOnce;
    });
  });

  describe('handleLoadFailed method', () => {
    it('calls config.onPreloadError', () => {
      sound = new Sound({onPreloadError: sinon.fake()});
      sound.handleLoadFailed();
      expect(sound.config.onPreloadError).to.have.been.calledOnce;
    });

    it('calls config.playAfterLoadOptions.callback', () => {
      sound = new Sound({playAfterLoadOptions: {callback: sinon.fake()}});
      sound.handleLoadFailed();
      expect(sound.config.playAfterLoadOptions.callback).to.have.been
        .calledOnce;
    });
  });

  describe('handlePlayStarted method', () => {
    beforeEach(() => {
      sound = new Sound({});
    });

    it('increments isPlaying property', () => {
      expect(sound.isPlayingCount).to.equal(0);
      sound.handlePlayStarted({});
      expect(sound.isPlayingCount).to.equal(1);
      sound.handlePlayStarted({});
      expect(sound.isPlayingCount).to.equal(2);
    });

    it('calls callback when passed in options', () => {
      let fakeCallback = sinon.fake();
      sound.handlePlayStarted({callback: fakeCallback});
      expect(fakeCallback).to.have.been.calledOnce;
    });
  });

  describe('stop method', () => {
    beforeEach(() => {
      sound = new Sound({});
    });

    it('calls stop on all playableBuffers', () => {
      let fakeStopMethod = sinon.fake();
      sound.playableBuffers = [{stop: fakeStopMethod}, {stop: fakeStopMethod}];
      sound.stop();
      expect(fakeStopMethod).to.have.been.calledTwice;
    });

    it('calls pause on audioElement', () => {
      let fakePauseMethod = sinon.fake();
      sound.audioElement = {pause: fakePauseMethod};
      sound.stop();
      expect(fakePauseMethod).to.have.been.calledOnce;
      expect(sound.audioElement.currentTime).to.equal(0);
    });
  });

  describe('isPlaying method', () => {
    it('returns value of isPlaying_ property', () => {
      sound = new Sound({});
      sound.isPlaying_ = true;
      expect(sound.isPlaying()).to.be.true;
      sound.isPlaying_ = false;
      expect(sound.isPlaying()).to.be.false;
    });
  });

  describe('isLoaded method', () => {
    it('returns value of isLoaded_ property', () => {
      sound = new Sound({});
      sound.isLoaded_ = true;
      expect(sound.isLoaded()).to.be.true;
      sound.isLoaded_ = false;
      expect(sound.isLoaded()).to.be.false;
    });
  });

  describe('didLoadFail method', () => {
    it('returns value of didLoadFail_ property', () => {
      sound = new Sound({});
      sound.didLoadFail_ = true;
      expect(sound.didLoadFail()).to.be.true;
      sound.didLoadFail_ = false;
      expect(sound.didLoadFail()).to.be.false;
    });
  });

  describe('preloadFile method', () => {
    beforeEach(() => {
      sound = new Sound({});
      jest.spyOn(sound, 'getPlayableFile').mockClear().mockReturnValue('/path/to/file');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('calls preloadViaWebAudio when AudioContext is provided', () => {
      sound.audioContext = new AudioContext();
      jest.spyOn(sound, 'preloadViaWebAudio').mockClear().mockImplementation();
      sound.preloadFile();
      expect(sound.preloadViaWebAudio).to.have.been.calledOnce;
    });

    it('calls preloadAudioElement when AudioContext is not provided', () => {
      sound.audioContext = null;
      jest.spyOn(sound, 'preloadAudioElement').mockClear().mockImplementation();
      sound.preloadFile();
      expect(sound.preloadAudioElement).to.have.been.calledOnce;
    });
  });

  describe('preloadBytes method', () => {
    beforeEach(() => {
      sound = new Sound({});
      jest.spyOn(sound, 'getPlayableBytes').mockClear().mockReturnValue('bytes');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('calls audioContext.decodeAudioData when AudioContext is provided', () => {
      sound.audioContext = new AudioContext();
      jest.spyOn(sound.audioContext, 'decodeAudioData').mockClear().mockImplementation();
      sound.preloadBytes();
      expect(sound.audioContext.decodeAudioData).to.have.been.calledOnce;
    });

    it('calls preloadAudioElement when no AudioContext is provided', () => {
      sound.audioContext = null;
      jest.spyOn(sound, 'preloadAudioElement').mockClear().mockImplementation();
      sound.preloadBytes();
      expect(sound.preloadAudioElement).to.have.been.calledOnce;
    });
  });

  describe('getPlayableFile method', () => {
    it('returns file location from config preferring mp3 > ogg > wav', () => {
      let canPlayTypeStub = jest.spyOn(window.Audio.prototype, 'canPlayType').mockClear().mockImplementation();
      let config = {mp3: 'file.mp3', ogg: 'file.ogg', wav: 'file.wav'};
      sound = new Sound(config);
      canPlayTypeStub.mockImplementation((...args) => {
        if (args[0] === 'audio/mp3') {
          return true;
        }
      });
      canPlayTypeStub.mockImplementation((...args) => {
        if (args[0] === 'audio/ogg') {
          return true;
        }
      });
      canPlayTypeStub.mockImplementation((...args) => {
        if (args[0] === 'audio/wav') {
          return true;
        }
      });
      expect(sound.getPlayableFile()).to.equal(config.mp3);
      canPlayTypeStub.mockImplementation((...args) => {
        if (args[0] === 'audio/mp3') {
          return false;
        }
      });
      expect(sound.getPlayableFile()).to.equal(config.ogg);
      canPlayTypeStub.mockImplementation((...args) => {
        if (args[0] === 'audio/ogg') {
          return false;
        }
      });
      expect(sound.getPlayableFile()).to.equal(config.wav);
      canPlayTypeStub.mockImplementation((...args) => {
        if (args[0] === 'audio/wav') {
          return false;
        }
      });
      expect(sound.getPlayableFile()).to.equal(false);
      jest.restoreAllMocks();
    });
  });

  describe('getPlayableBytes method', () => {
    beforeEach(() => {
      sound = new Sound({});
      sound.config.bytes = 'bytes';
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns this.config.bytes when browser can play audio/mp3', () => {
      jest.spyOn(window.Audio.prototype, 'canPlayType').mockClear().mockReturnValue(true);
      expect(sound.getPlayableBytes()).to.equal(sound.config.bytes);
    });

    it('returns false when browser cannot play audio/mp3', () => {
      jest.spyOn(window.Audio.prototype, 'canPlayType').mockClear().mockReturnValue(false);
      expect(sound.getPlayableBytes()).to.equal(false);
    });
  });
});
