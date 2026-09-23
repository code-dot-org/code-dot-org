export interface Voice {
  oscillator: OscillatorNode;
  gain: GainNode;
}

// Browsers keep a context suspended until a user gesture, and Safari leaves
// one 'interrupted' after a phone call or another app takes the audio.
export function wake(context: AudioContext): void {
  if (context.state !== 'running' && context.state !== 'closed') {
    context.resume().catch(() => undefined);
  }
}

export function startVoice(
  context: AudioContext,
  type: OscillatorType,
  hz: number
): Voice {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = hz;
  gain.gain.value = 0;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  return {oscillator, gain};
}

export function endVoice({oscillator, gain}: Voice): void {
  gain.gain.value = 0;
  oscillator.stop();
  oscillator.disconnect();
  gain.disconnect();
}
