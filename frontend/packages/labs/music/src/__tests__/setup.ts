// Vitest setup: install the MSW node server so tests exercise the real
// `kyTransport` end to end. Per-test overrides via `mockServer.use(...)`.

import {afterAll, afterEach, beforeAll, vi} from 'vitest';

import {mockServer} from '@code-dot-org/core/api/mocks/server';

beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

// Tone.js eagerly constructs a `standardized-audio-context` AudioContext when
// its module loads, which jsdom can't satisfy. Mock the library with chainable
// no-op nodes — the player's tone symbols are only constructed inside methods,
// and these tests render the lab without exercising real playback. (The factory
// is hoisted above imports, so it must define its helpers inline.)
vi.mock('tone', () => {
  class ToneNode {
    toDestination = () => this;
    connect = () => this;
    disconnect = () => this;
    chain = () => this;
    start = () => this;
    stop = () => this;
    dispose = () => this;
  }
  return {
    Filter: ToneNode,
    GrainPlayer: ToneNode,
    PingPongDelay: ToneNode,
    Player: ToneNode,
    Sampler: ToneNode,
    Transport: {
      position: 0,
      loopStart: 0,
      loopEnd: 0,
      loop: false,
      bpm: {value: 120},
      start: () => undefined,
      stop: () => undefined,
      pause: () => undefined,
      cancel: () => undefined,
      scheduleRepeat: () => undefined,
    },
    getContext: () => ({state: 'running'}),
    start: () => Promise.resolve(),
  };
});

// jsdom provides no Web Audio API, but Music Lab's player modules reference
// `AudioContext` (at construction time) as soon as the lab is imported. These
// tests render the lab without exercising real playback, so a minimal no-op
// stub is enough to keep imports and renders from throwing.
const noop = () => undefined;

class StubAudioParam {
  value = 0;
  setValueAtTime = noop;
  linearRampToValueAtTime = noop;
  exponentialRampToValueAtTime = noop;
  setTargetAtTime = noop;
  cancelScheduledValues = noop;
}

class StubAudioNode {
  gain = new StubAudioParam();
  frequency = new StubAudioParam();
  Q = new StubAudioParam();
  delayTime = new StubAudioParam();
  detune = new StubAudioParam();
  buffer: unknown = null;
  type = '';
  onended: (() => void) | null = null;
  connect = () => new StubAudioNode();
  disconnect = noop;
  start = noop;
  stop = noop;
}

class StubAudioBuffer {
  duration = 0;
  length = 0;
  numberOfChannels = 1;
  sampleRate = 48000;
  getChannelData = () => new Float32Array(0);
}

class StubAudioContext {
  currentTime = 0;
  sampleRate = 48000;
  state = 'running';
  destination = new StubAudioNode();
  createGain = () => new StubAudioNode();
  createBufferSource = () => new StubAudioNode();
  createBiquadFilter = () => new StubAudioNode();
  createDelay = () => new StubAudioNode();
  createBuffer = () => new StubAudioBuffer();
  decodeAudioData = () => Promise.resolve(new StubAudioBuffer());
  resume = () => Promise.resolve();
  close = () => Promise.resolve();
}

for (const key of ['AudioContext', 'webkitAudioContext']) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value: StubAudioContext,
  });
}
