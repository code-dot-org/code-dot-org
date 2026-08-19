// What a tick's sound comes to, as calls.
//
// The engine says two things about sound and they arrive differently: the
// one-shots raised this tick, drained from a queue, and the track that should
// be playing, read from the world (specs/SOUND.md). This turns both into calls
// on something that can make a noise.
//
// Pure, and behind a port, for the reason `reconcile` and `backdropPlacement`
// are: Phaser is a browser and the decision is not. What is worth testing here
// is that a one-shot fires every time and a track fires only when it CHANGES —
// and neither of those needs an AudioContext to be wrong.

/** What the driver can actually do with sound. Phaser implements it. */
export interface SoundOutput {
  /** Play a sound once, now. */
  play(name: string): void;
  /** Start a track looping, replacing nothing — the caller stops first. */
  startMusic(name: string): void;
  /** Stop whatever track is playing. */
  stopMusic(): void;
}

/**
 * The driver's sound state: which track it believes is playing.
 *
 * That one field is the whole reason this is a class. A one-shot needs no
 * memory — it happened, it plays — but a track is a value the world reports
 * every frame, and starting it every frame would be sixty overlapping copies a
 * second. So the only question is whether what the world reports now differs
 * from what was started last.
 */
export class SoundChannel {
  private readonly out: SoundOutput;
  /** The track this channel started, or undefined if it started none. */
  private track: string | undefined;

  constructor(out: SoundOutput) {
    this.out = out;
  }

  /**
   * Apply a tick's sound: everything raised, and the track that should play.
   *
   * Called after `tick`, with `world.drainSounds()` and `world.music()`.
   */
  sync(played: readonly string[], music: string | undefined): void {
    // Every one, in the order raised, repeats included — two coins collected in
    // one tick are two pops (World.playSound).
    for (const name of played) {
      this.out.play(name);
    }
    if (music === this.track) {
      return;
    }
    // Stopped before started, and unconditionally: swapping tracks means the
    // old one ends. A crossfade is a thing to want later and a thing to say
    // then; two tracks playing because nobody stopped the first is not.
    if (this.track !== undefined) {
      this.out.stopMusic();
    }
    this.track = music;
    if (music !== undefined) {
      this.out.startMusic(music);
    }
  }

  /**
   * Silence, for a game that is going away.
   *
   * A restart tears the scene down and builds another, and a track that
   * outlived its game would play under the next one — which is what "the music
   * kept going after I pressed Restart" is.
   */
  stop(): void {
    if (this.track !== undefined) {
      this.out.stopMusic();
      this.track = undefined;
    }
  }
}
