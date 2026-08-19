// Listening to a sound before choosing it.
//
// The thing the backdrop shelf did not need: a backdrop tile IS its preview,
// and a sound tile cannot be, so the shelf grows a play button and something
// has to own what is playing.
//
// ONE AT A TIME, which is the whole rule. A shelf where clicking three rows
// plays three overlapping sounds is a shelf nobody can hear, and it is the
// first thing that happens to anyone browsing quickly. Sprite Lab reaches for a
// global audio manager (`Sounds.getSingleton()`) and calls `stopAllAudio` at
// the two moments that matter; this owns one element instead, because a
// singleton is a thing to remember to clear and an element is a thing to drop.
//
// A thin seam over `Audio` rather than a hook, for the reason the driver's
// `SoundChannel` is a class behind a port: what is worth testing is "playing
// this stops that", and that does not need a browser that can decode mp3.

/** What a preview needs of an audio element. `HTMLAudioElement` satisfies it. */
export interface Playable {
  play(): void;
  pause(): void;
  currentTime: number;
}

/** Makes a player for a URL. Swapped in tests; `new Audio(url)` in a browser. */
export type MakePlayable = (url: string) => Playable;

const audio: MakePlayable = url => new Audio(url);

/**
 * The shelf's player: at most one sound, and a way to stop it.
 *
 * Rewound as well as paused, because the next `play` of the same row should
 * start it again rather than resume it three seconds in — which is what a
 * learner comparing two similar sounds does constantly.
 */
export class SoundPreview {
  private readonly make: MakePlayable;
  private current: Playable | undefined;
  /** Which sound is playing, for the shelf to show. */
  private sounding: string | undefined;

  constructor(make: MakePlayable = audio) {
    this.make = make;
  }

  /** The id of what is playing, or undefined. */
  playing(): string | undefined {
    return this.sounding;
  }

  /** Play one, stopping whatever was playing first. */
  play(id: string, url: string): void {
    this.stop();
    this.sounding = id;
    this.current = this.make(url);
    this.current.play();
  }

  /**
   * Silence.
   *
   * Called when the dialog closes and when a choice is made — the same two
   * moments Sprite Lab calls `stopAllAudio` at, and for the same reason: a
   * preview still going while the game starts is two soundtracks.
   */
  stop(): void {
    if (!this.current) {
      return;
    }
    this.current.pause();
    this.current.currentTime = 0;
    this.current = undefined;
    this.sounding = undefined;
  }
}
