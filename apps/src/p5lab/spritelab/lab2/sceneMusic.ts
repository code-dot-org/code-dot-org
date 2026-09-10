import ProjectPlayer from '@cdo/apps/music/ProjectPlayer';

/** The slice of ProjectPlayer this class drives; tests hand in fakes. */
export type BackgroundPlayer = Pick<
  ProjectPlayer,
  'loadProject' | 'getMetadata' | 'playLooping' | 'stop'
>;

/**
 * Background music for a game: one Music Lab project at a time, repeating
 * from its first measure to its last; asking for the song already playing
 * changes nothing. Constructing the player builds Music Lab's whole chain,
 * which is fine here because a SceneMusic is only made on the first
 * play-music block — most games have none.
 */
export default class SceneMusic {
  private current: string | null = null;
  // The last channel whose load failed, so a repeating event can't fetch
  // a broken song once per firing. stop() or a different song clears it;
  // the next run retries.
  private failed: string | null = null;
  private request = 0;
  // The in-flight start, if any: the player is shared and stateful, so a
  // new start first waits for the previous one to settle.
  private starting: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly player: BackgroundPlayer = new ProjectPlayer()
  ) {}

  /** The channel of the song playing or loading, if any. */
  get playing(): string | null {
    return this.current;
  }

  /**
   * Play a project's song, repeating, until stop() or another song. Resolves
   * true when the song is playing; false when it could not be (superseded by
   * a later request, or the project would not load). A failed song is
   * refused without another fetch until the next run.
   */
  play(channelId: string): Promise<boolean> {
    if (channelId === this.current) {
      return Promise.resolve(true);
    }
    if (channelId === this.failed) {
      return Promise.resolve(false);
    }
    this.failed = null;
    const request = ++this.request;
    this.player.stop();
    this.current = channelId;
    const previous = this.starting;
    const started = (async () => {
      // A rejected predecessor already reported to its own caller.
      await previous.catch(() => {});
      return this.startSong(channelId, request);
    })();
    this.starting = started.catch(() => {});
    return started;
  }

  private async startSong(
    channelId: string,
    request: number
  ): Promise<boolean> {
    if (request !== this.request) {
      return false;
    }
    try {
      await this.player.loadProject(channelId);
    } catch (e) {
      this.forget(channelId, request);
      throw e;
    }
    if (request !== this.request) {
      return false;
    }
    // A project that would not load comes back as Music Lab's built-in
    // metadata: silence, not the built-in song.
    if (this.player.getMetadata().channelId !== channelId) {
      this.forget(channelId, request);
      return false;
    }
    this.player.playLooping();
    return true;
  }

  // Nothing is playing after a failed load; the channel is remembered as
  // failed so repeat requests stay quiet until the next run.
  private forget(channelId: string, request: number): void {
    if (request === this.request && this.current === channelId) {
      this.current = null;
      this.failed = channelId;
    }
  }

  stop(): void {
    this.request++;
    this.player.stop();
    this.current = null;
    this.failed = null;
  }
}
