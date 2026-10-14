import {JsonVideo} from '../index';

interface VideoJson {
  scenes: {duration: string; speech?: string; html?: string}[];
}

// Three 2s scenes; the middle one has no speech.
const VIDEO: VideoJson = {
  scenes: [
    {duration: '2s', speech: 'one', html: '<p>1</p>'},
    {duration: '2s', html: '<p>2</p>'},
    {duration: '2s', speech: 'three', html: '<p>3</p>'},
  ],
};

const MEDIA_EVENTS = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'ratechange',
  'seeked',
  'seeking',
  'timeupdate',
  'volumechange',
  'waiting',
];

function dataUri(video: VideoJson): string {
  return `data:application/json,${encodeURIComponent(JSON.stringify(video))}`;
}

function recordEvents(el: JsonVideo): string[] {
  const events: string[] = [];
  MEDIA_EVENTS.forEach(type =>
    el.addEventListener(type, () => events.push(type)),
  );
  return events;
}

// An element in the shadow root; tests fail loudly if it is missing.
function inShadow<T extends Element = HTMLElement>(
  el: JsonVideo,
  selector: string,
): T {
  const found = el.shadowRoot?.querySelector<T>(selector);
  if (!found) throw new Error(`${selector} not found`);
  return found;
}

function cueText(cue: TextTrackCue | undefined): string | undefined {
  return (cue as VTTCue | undefined)?.text;
}

// Lets the element's asynchronous load run to completion.
async function flush() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

async function loadedVideo(video = VIDEO): Promise<JsonVideo> {
  const el = document.createElement('json-video');
  document.body.appendChild(el);
  el.src = dataUri(video);
  await flush();
  return el;
}

// Advances the playback clock by ms, one animation frame at a time.
function advance(ms: number): void {
  vi.advanceTimersByTime(ms);
}

describe('JsonVideo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    URL.createObjectURL = vi.fn(() => 'blob:scene');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() =>
      Promise.resolve(),
    );
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('before loading', () => {
    it('reports an empty media element', () => {
      const el = document.createElement('json-video');
      expect(el.paused).toBe(true);
      expect(el.duration).toBeNaN();
      expect(el.currentTime).toBe(0);
      expect(el.readyState).toBe(JsonVideo.HAVE_NOTHING);
      expect(el.networkState).toBe(el.NETWORK_EMPTY);
      expect(el.buffered.length).toBe(0);
      expect(el.seekable.length).toBe(0);
      expect(el.error).toBeNull();
      expect(el.currentSrc).toBe('');
    });

    it('rejects play() without a source', async () => {
      const el = document.createElement('json-video');
      await expect(el.play()).rejects.toMatchObject({
        name: 'NotSupportedError',
      });
      expect(el.paused).toBe(true);
    });

    it('uses a currentTime set before load as the start position', async () => {
      const el = document.createElement('json-video');
      el.src = dataUri(VIDEO);
      el.currentTime = 3;
      expect(el.currentTime).toBe(3);
      await flush();
      expect(el.currentTime).toBe(3);
    });
  });

  describe('loading', () => {
    it('fires loading events in native order', async () => {
      const el = document.createElement('json-video');
      const events = recordEvents(el);
      el.src = dataUri(VIDEO);
      expect(events).toEqual([]);
      await flush();
      expect(events).toEqual([
        'loadstart',
        'durationchange',
        'loadedmetadata',
        'loadeddata',
        'canplay',
        'canplaythrough',
      ]);
      expect(el.duration).toBe(6);
      expect(el.readyState).toBe(JsonVideo.HAVE_ENOUGH_DATA);
      expect(el.networkState).toBe(JsonVideo.NETWORK_IDLE);
      expect(el.currentSrc).toBe(dataUri(VIDEO));
      expect(el.buffered.length).toBe(1);
      expect(el.seekable.end(0)).toBe(6);
      expect(() => el.seekable.start(1)).toThrow(DOMException);
    });

    it('reports a decode error for malformed JSON', async () => {
      const el = document.createElement('json-video');
      const events = recordEvents(el);
      el.src = 'data:application/json,{not json';
      await flush();
      expect(events).toEqual(['loadstart', 'error']);
      expect(el.error?.code).toBe(3);
      expect(el.classList.contains('has-error')).toBe(true);
      await expect(el.play()).rejects.toMatchObject({
        name: 'NotSupportedError',
      });
    });

    it('clears an earlier error on a successful load', async () => {
      const el = document.createElement('json-video');
      el.src = 'data:application/json,{not json';
      await flush();
      el.src = dataUri(VIDEO);
      await flush();
      expect(el.error).toBeNull();
      expect(el.classList.contains('has-error')).toBe(false);
    });

    it('empties the old video on a new src', async () => {
      const el = await loadedVideo();
      await el.play();
      advance(1000);
      const events = recordEvents(el);
      el.src = dataUri({scenes: [{duration: '5s'}]});
      expect(el.paused).toBe(true);
      expect(el.duration).toBeNaN();
      await flush();
      expect(events.slice(0, 3)).toEqual(['abort', 'emptied', 'loadstart']);
      expect(el.duration).toBe(5);
      expect(el.currentTime).toBe(0);
    });

    it('aborts a pending play() on a new src', async () => {
      const el = document.createElement('json-video');
      el.src = dataUri(VIDEO);
      const playPromise = el.play();
      el.src = dataUri({scenes: [{duration: '5s'}]});
      await expect(playPromise).rejects.toMatchObject({name: 'AbortError'});
    });

    it('ignores a superseded load', async () => {
      const el = document.createElement('json-video');
      el.src = dataUri({scenes: [{duration: '9s'}]});
      el.src = dataUri(VIDEO);
      await flush();
      expect(el.duration).toBe(6);
    });
  });

  describe('play and pause', () => {
    it('plays and resolves the play() promise', async () => {
      const el = await loadedVideo();
      const events = recordEvents(el);
      await expect(el.play()).resolves.toBeUndefined();
      expect(events).toEqual(['play', 'playing']);
      expect(el.paused).toBe(false);
      advance(1000);
      expect(el.currentTime).toBeCloseTo(1, 1);
    });

    it('waits for data when played before loading', async () => {
      const el = document.createElement('json-video');
      el.src = dataUri(VIDEO);
      const events = recordEvents(el);
      const playPromise = el.play();
      expect(el.paused).toBe(false);
      expect(events).toEqual(['play', 'waiting']);
      await flush();
      await expect(playPromise).resolves.toBeUndefined();
      expect(events).toContain('playing');
    });

    it('rejects a pending play() when paused', async () => {
      const el = document.createElement('json-video');
      el.src = dataUri(VIDEO);
      const playPromise = el.play();
      el.pause();
      await expect(playPromise).rejects.toMatchObject({name: 'AbortError'});
    });

    it('fires timeupdate then pause, and nothing when already paused', async () => {
      const el = await loadedVideo();
      await el.play();
      const events = recordEvents(el);
      el.pause();
      el.pause();
      expect(events).toEqual(['timeupdate', 'pause']);
    });

    it('throttles timeupdate during playback', async () => {
      const el = await loadedVideo();
      await el.play();
      const events = recordEvents(el);
      advance(1000);
      const count = events.filter(e => e === 'timeupdate').length;
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
    });

    it('fires timeupdate, pause, ended at the end', async () => {
      const el = await loadedVideo();
      await el.play();
      const events = recordEvents(el);
      advance(7000);
      expect(events.slice(-3)).toEqual(['timeupdate', 'pause', 'ended']);
      expect(el.ended).toBe(true);
      expect(el.paused).toBe(true);
      expect(el.currentTime).toBe(6);
    });

    it('restarts from the beginning when played after ending', async () => {
      const el = await loadedVideo();
      el.currentTime = 6;
      expect(el.ended).toBe(true);
      await el.play();
      expect(el.currentTime).toBe(0);
      expect(el.ended).toBe(false);
    });

    it('loops instead of ending', async () => {
      const el = await loadedVideo();
      el.loop = true;
      await el.play();
      const events = recordEvents(el);
      advance(7000);
      expect(events).not.toContain('ended');
      expect(events).toContain('seeked');
      expect(el.paused).toBe(false);
      expect(el.currentTime).toBeLessThan(2);
    });

    it('autoplays', async () => {
      const el = document.createElement('json-video');
      el.autoplay = true;
      el.src = dataUri(VIDEO);
      await flush();
      expect(el.paused).toBe(false);
    });

    it('records played ranges', async () => {
      const el = await loadedVideo();
      await el.play();
      advance(1000);
      el.currentTime = 4;
      advance(1000);
      el.pause();
      expect(el.played.length).toBe(2);
      expect(el.played.start(0)).toBe(0);
      expect(el.played.start(1)).toBe(4);
      expect(el.played.end(1)).toBeCloseTo(5, 1);
    });
  });

  describe('seeking', () => {
    it('fires seeking, timeupdate, seeked', async () => {
      const el = await loadedVideo();
      const events = recordEvents(el);
      let seekingDuringEvent = null;
      el.addEventListener('seeking', () => (seekingDuringEvent = el.seeking));
      el.currentTime = 3;
      expect(events).toEqual(['seeking', 'timeupdate', 'seeked']);
      expect(seekingDuringEvent).toBe(true);
      expect(el.seeking).toBe(false);
      expect(el.currentTime).toBe(3);
    });

    it('clamps to the duration and rejects non-finite times', async () => {
      const el = await loadedVideo();
      el.currentTime = 100;
      expect(el.currentTime).toBe(6);
      expect(() => (el.currentTime = NaN)).toThrow(TypeError);
    });
  });

  describe('volume and rate', () => {
    it('fires volumechange for volume and muted', async () => {
      const el = await loadedVideo();
      const events = recordEvents(el);
      el.volume = 0.5;
      el.volume = 0.5;
      el.muted = true;
      el.muted = true;
      expect(events).toEqual(['volumechange', 'volumechange']);
      expect(() => (el.volume = 2)).toThrow(DOMException);
    });

    it('takes the initial muted state from the muted attribute', () => {
      const el = document.createElement('json-video');
      el.setAttribute('muted', '');
      document.body.appendChild(el);
      expect(el.muted).toBe(true);
      expect(el.defaultMuted).toBe(true);
    });

    it('plays at playbackRate', async () => {
      const el = await loadedVideo();
      const events = recordEvents(el);
      el.playbackRate = 2;
      expect(events).toEqual(['ratechange']);
      await el.play();
      advance(1000);
      expect(el.currentTime).toBeCloseTo(2, 1);
      expect(() => (el.playbackRate = 100)).toThrow(DOMException);
    });

    it('resets playbackRate to defaultPlaybackRate on load', async () => {
      const el = await loadedVideo();
      el.playbackRate = 2;
      el.src = dataUri({scenes: [{duration: '5s'}]});
      expect(el.playbackRate).toBe(1);
    });
  });

  describe('captions', () => {
    function captionOverlay(el: JsonVideo): HTMLElement {
      return inShadow(el, '#closed-caption-overlay');
    }

    it('exposes one disabled captions track built from speech', async () => {
      const el = await loadedVideo();
      expect(el.textTracks.length).toBe(1);
      const track = el.textTracks[0];
      expect(track.kind).toBe('captions');
      expect(track.mode).toBe('disabled');
      expect(track.cues).toBeNull();
      expect(track.activeCues).toBeNull();
      track.mode = 'hidden';
      expect(
        Array.from(track.cues ?? []).map(c => [c.startTime, cueText(c)]),
      ).toEqual([
        [0, 'one'],
        [4, 'three'],
      ]);
      expect(cueText(track.activeCues?.[0])).toBe('one');
    });

    it('shows the overlay only in showing mode', async () => {
      const el = await loadedVideo();
      const track = el.textTracks[0];
      expect(captionOverlay(el).classList.contains('hidden')).toBe(true);
      track.mode = 'showing';
      expect(captionOverlay(el).classList.contains('hidden')).toBe(false);
      expect(captionOverlay(el).textContent).toBe('one');
      track.mode = 'hidden';
      expect(captionOverlay(el).classList.contains('hidden')).toBe(true);
      track.mode = 'bogus' as TextTrackMode;
      expect(track.mode).toBe('hidden');
    });

    it('fires cuechange, enter and exit as scenes change', async () => {
      const el = await loadedVideo();
      const track = el.textTracks[0];
      track.mode = 'hidden';
      const first = track.cues![0];
      const log: string[] = [];
      track.oncuechange = () => log.push('cuechange');
      first.onexit = () => log.push('exit');
      track.cues![1].addEventListener('enter', () => log.push('enter'));
      el.currentTime = 3;
      expect(track.activeCues?.length).toBe(0);
      el.currentTime = 5;
      expect(cueText(track.activeCues?.[0])).toBe('three');
      expect(log).toEqual(['exit', 'cuechange', 'enter', 'cuechange']);
    });

    it('fires change on textTracks when a mode changes', async () => {
      const el = await loadedVideo();
      const onChange = vi.fn();
      el.textTracks.addEventListener('change', onChange);
      el.textTracks[0].mode = 'showing';
      el.textTracks[0].mode = 'hidden';
      expect(onChange).not.toHaveBeenCalled();
      advance(0);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('toggles the track from the built-in captions button', async () => {
      const el = await loadedVideo();
      const button = inShadow(el, '#cc-btn');
      expect(button.classList.contains('hidden')).toBe(false);
      button.click();
      expect(el.textTracks[0].mode).toBe('showing');
      expect(button.getAttribute('aria-pressed')).toBe('true');
      button.click();
      expect(el.textTracks[0].mode).toBe('disabled');
    });

    it('keeps the captions button during a scene without speech', async () => {
      const el = await loadedVideo();
      el.currentTime = 3;
      const button = inShadow(el, '#cc-btn');
      expect(button.classList.contains('hidden')).toBe(false);
    });

    it('hides the captions button when no scene has speech', async () => {
      const el = await loadedVideo({scenes: [{duration: '1s'}]});
      const button = inShadow(el, '#cc-btn');
      expect(button.classList.contains('hidden')).toBe(true);
    });
  });

  describe('controls', () => {
    it('reflects controls, loop and autoplay', () => {
      const el = document.createElement('json-video');
      el.controls = true;
      el.loop = true;
      expect(el.hasAttribute('controls')).toBe(true);
      expect(el.hasAttribute('loop')).toBe(true);
      el.controls = false;
      expect(el.hasAttribute('controls')).toBe(false);
      expect(el.autoplay).toBe(false);
    });

    it('toggles playback on click only with controls', async () => {
      const el = await loadedVideo();
      const container = inShadow(el, '#video-container');
      container.click();
      expect(el.paused).toBe(true);
      el.controls = true;
      container.click();
      expect(el.paused).toBe(false);
    });

    it('mutes from the built-in mute button without losing the volume', async () => {
      const el = await loadedVideo();
      el.volume = 0.4;
      const button = inShadow(el, '#mute-btn');
      button.click();
      expect(el.muted).toBe(true);
      expect(el.volume).toBe(0.4);
      button.click();
      expect(el.muted).toBe(false);
    });

    it('adds state names to the button parts', async () => {
      const el = await loadedVideo();
      const part = (selector: string) =>
        inShadow(el, selector).getAttribute('part');

      await el.play();
      el.muted = true;
      el.textTracks[0].mode = 'showing';
      expect(part('#play-btn')).toBe('play-button playing');
      expect(part('#mute-btn')).toBe('mute-button muted');
      expect(part('#cc-btn')).toBe('captions-button captions-on');

      el.pause();
      el.muted = false;
      el.textTracks[0].mode = 'disabled';
      expect(part('#play-btn')).toBe('play-button');
      expect(part('#mute-btn')).toBe('mute-button');
      expect(part('#cc-btn')).toBe('captions-button');
    });

    it('renders children over the video through a slot', () => {
      const el = document.createElement('json-video');
      expect(el.shadowRoot?.querySelector('slot')).not.toBeNull();
    });
  });

  it('answers canPlayType for JSON only', () => {
    const el = document.createElement('json-video');
    expect(el.canPlayType('application/json')).toBe('probably');
    expect(el.canPlayType('video/mp4')).toBe('');
  });
});
