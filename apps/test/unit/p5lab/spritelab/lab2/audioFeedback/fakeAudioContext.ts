// Records what the voices ask of Web Audio, to test them without a sound
// card. Each voice makes its oscillator then its gain, so createGain attaches
// to the most recent oscillator.

export interface FakeVoice {
  type: string;
  hz: number;
  /** Frequency ramps. */
  sweeps: {to: number; at: number}[];
  /** Frequency targets. */
  glides: number[];
  /** Gain targets. */
  levels: number[];
  /** Time constant of each gain target, in order. */
  taus: number[];
  /** Gain attack peaks. */
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
