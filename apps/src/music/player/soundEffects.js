export function InsertEffects(audioContext, effects, lastNode) {
  if (['low', 'medium'].includes(effects.volume)) {
    const volume = audioContext.createGain();
    volume.gain.value = effects.volume === 'low' ? 0.4 : 0.75;

    // Connect the last node to this one.
    lastNode.connect(volume);

    // This is now the last node.
    lastNode = volume;
  }

  if (['low', 'medium'].includes(effects.filter)) {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = effects.filter === 'low' ? 800 : 3000;

    // Connect the last node to this one.
    lastNode.connect(filter);

    // This is now the last node.
    lastNode = filter;
  }

  if (['low', 'medium'].includes(effects.delay)) {
    // Create a node that does nothing so we can join the two outputs
    // to it.
    const output = audioContext.createGain();
    output.gain.value = 1;

    const delay = audioContext.createDelay();
    delay.delayTime.value = 0.25;

    const dry = audioContext.createGain();
    const wet = audioContext.createGain();
    const feedback = audioContext.createGain();
    feedback.gain.value = effects.delay === 'low' ? 0.1 : 0.3;

    lastNode.connect(dry);
    dry.connect(output);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 4000;

    lastNode.connect(filter);
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(filter);

    delay.connect(wet);
    wet.connect(output);

    // This is now the last node.
    lastNode = output;
  }

  return lastNode;
}
