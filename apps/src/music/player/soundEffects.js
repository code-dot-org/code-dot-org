// This class generates various sound effects, and can insert them into
// an existing Web Audio graph.  It pre-generates busses for all
// possible combinations of more expensive sound effects, so that any
// sound can attach to the right one.

export default class SoundEffects {
  constructor(audioContext, delayTimeSeconds) {
    this.audioContext = audioContext;
    this.delayTimeSeconds = delayTimeSeconds;
    this.busses = {};
    this.generateBusses();
  }

  // Generate a unique key string for a given set of effects.
  generateKeyString(effects) {
    let keyStrings = [];
    if (effects.filter === 'medium') {
      keyStrings.push('filter_medium');
    }
    if (effects.filter === 'low') {
      keyStrings.push('filter_low');
    }
    if (effects.delay === 'medium') {
      keyStrings.push('delay_medium');
    }
    if (effects.delay === 'low') {
      keyStrings.push('delay_low');
    }
    return keyStrings.join('-');
  }

  // Generates a set of busses.  Because these effects can be
  // expensive, we want to pre-generate the busses and then connect
  // sounds to the appropriate one.
  generateBusses() {
    const busEffectsCombinations = [
      {filter: 'medium', delay: 'medium'},
      {filter: 'low', delay: 'low'},
      {filter: 'low', delay: 'medium'},
      {filter: 'medium', delay: 'low'},
      {filter: 'medium'},
      {filter: 'low'},
      {delay: 'medium'},
      {delay: 'low'},
    ];

    busEffectsCombinations.forEach(busEffects => {
      const {firstNode, lastNode} = this.generateBus(busEffects);

      // The bus connects to our main output.
      lastNode.connect(this.audioContext.destination);

      // Save the pre-generated bus.
      const keyString = this.generateKeyString(busEffects);
      this.busses[keyString] = firstNode;
    });
  }

  // Generate a bus for the given effects.
  generateBus(effects) {
    let firstNode = null;
    let lastNode = null;

    if (['low', 'medium'].includes(effects.filter)) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = effects.filter === 'low' ? 800 : 3000;

      // This is the first node.
      firstNode = filter;

      // This is now the last node.
      lastNode = filter;
    }

    if (['low', 'medium'].includes(effects.delay)) {
      // Create a node that does nothing so it can be the beginning.
      const input = this.audioContext.createGain();
      input.gain.value = 1;

      // Create a node that does nothing so we can join the two outputs
      // to it.
      const output = this.audioContext.createGain();
      output.gain.value = 1;

      const delay = this.audioContext.createDelay();

      delay.delayTime.value = this.delayTimeSeconds;

      const dry = this.audioContext.createGain();
      const wet = this.audioContext.createGain();

      const feedback = this.audioContext.createGain();
      feedback.gain.value = effects.delay === 'low' ? 0.1 : 0.3;

      input.connect(dry);
      dry.connect(output);

      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 4000;

      input.connect(filter);
      filter.connect(delay);
      delay.connect(feedback);
      feedback.connect(filter);

      delay.connect(wet);
      wet.connect(output);

      if (lastNode) {
        // Connect the last node to this one.
        lastNode.connect(input);
      } else {
        // This is the first node.
        firstNode = input;
      }
      // This is now the last node.
      lastNode = output;
    }

    return {firstNode, lastNode};
  }

  // Inserts the desired effects, using lastNode as its attachment
  // point into the Web Audio graph, and attaching everything to the
  // audio context's output.
  insertEffects(effects, lastNode) {
    // Volume is inserted per sound, so possibly add it here.
    if (['low', 'medium'].includes(effects.volume)) {
      const volume = this.audioContext.createGain();
      volume.gain.value = effects.volume === 'low' ? 0.4 : 0.75;

      lastNode.connect(volume);

      // This is now the last node.
      lastNode = volume;
    }

    // For other effects, find the right bus to attach to.
    const keyString = this.generateKeyString(effects);
    const bus = this.busses[keyString];
    if (bus) {
      // Attach the last node to that bus, which is already
      // connected to the output.
      lastNode.connect(bus);
    } else {
      // Connect directly to the output.
      lastNode.connect(this.audioContext.destination);
    }
  }
}
