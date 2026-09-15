// A stand-in for Web Audio that records what the voices ask of it, so they
// can be tested without a sound card. Each voice makes its oscillator and
// then its gain, so a gain belongs to the oscillator made just before it.

export interface FakeVoice {
  type: string;
  /** The note it starts on. */
  hz: number;
  /** A slide to `to`, arriving at `at`. */
  sweeps: {to: number; at: number}[];
  /** A pitch it was sent toward. */
  glides: number[];
  /** A volume a held voice was sent toward. */
  levels: number[];
  /** How fast each of those moves, in the same order. */
  taus: number[];
  /** The volume a struck blip rises to. */
  peaks: {to: number; at: number}[];
  stopped: boolean;
}

export function fakeAudioContext() {
  const voices: FakeVoice[] = [];
  let pending: FakeVoice | null = null;

  const context = {
    state: 'suspended' as AudioContextState,
    currentTime: 0,
    sampleRate: 44100,
    destination: {} as AudioDestinationNode,
    resumed: 0,
    resume() {
      context.resumed++;
      context.state = 'running';
      return Promise.resolve();
    },
    close: () => Promise.resolve(),
    createOscillator() {
      const voice: FakeVoice = {
        type: '',
        hz: 0,
        sweeps: [],
        glides: [],
        levels: [],
        taus: [],
        peaks: [],
        stopped: false,
      };
      pending = voice;
      voices.push(voice);
      return {
        set type(value: string) {
          voice.type = value;
        },
        frequency: {
          set value(hz: number) {
            voice.hz = hz;
          },
          setValueAtTime: (hz: number) => {
            voice.hz = hz;
          },
          setTargetAtTime: (to: number) => {
            voice.glides.push(to);
          },
          exponentialRampToValueAtTime: (to: number, at: number) => {
            voice.sweeps.push({to, at});
          },
        },
        connect: () => undefined,
        disconnect: () => undefined,
        start: () => undefined,
        stop: () => {
          voice.stopped = true;
        },
        onended: null,
      } as unknown as OscillatorNode;
    },
    createGain() {
      const voice = pending;
      return {
        gain: {
          value: 0,
          setValueAtTime: () => undefined,
          setTargetAtTime: (to: number, at: number, tau: number) => {
            voice?.levels.push(to);
            voice?.taus.push(tau);
          },
          linearRampToValueAtTime: (to: number, at: number) => {
            voice?.peaks.push({to, at});
          },
          exponentialRampToValueAtTime: () => undefined,
        },
        connect: () => undefined,
        disconnect: () => undefined,
      } as unknown as GainNode;
    },
  };

  const asAudioContext = () => context as unknown as AudioContext;

  return {context, voices, asAudioContext};
}

/** The same fake, behind `new AudioContext()`, for code that builds its own. */
export function installFakeAudioContext() {
  const fake = fakeAudioContext();
  (window as unknown as {AudioContext: unknown}).AudioContext = function () {
    return fake.context;
  };
  return fake;
}
