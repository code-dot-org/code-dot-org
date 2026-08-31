import MusicPlayer from '@cdo/apps/music/player/MusicPlayer';
import ProjectPlayer from '@cdo/apps/music/ProjectPlayer';

// The first measure of a song; playback positions are 1-based measures.
const FIRST_MEASURE = 1;

function createMusicPlayers(): {
  musicPlayer: MusicPlayer;
  projectPlayer: ProjectPlayer;
} {
  const musicPlayer = new MusicPlayer();
  return {musicPlayer, projectPlayer: new ProjectPlayer(musicPlayer)};
}

/**
 * Background music for a game: one Music Lab project at a time, repeating
 * from its first measure to its last; asking for the song already playing
 * changes nothing. The players are created on the first song, since most
 * games have none.
 */
export default class SceneMusic {
  private musicPlayer: MusicPlayer | null = null;
  private projectPlayer: ProjectPlayer | null = null;
  private current: string | null = null;
  private request = 0;
  // Loads run one at a time: the players are shared and stateful, so a
  // second load must not start until the first has settled.
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly createPlayers: () => {
      musicPlayer: MusicPlayer;
      projectPlayer: ProjectPlayer;
    } = createMusicPlayers
  ) {}

  /** The channel of the song playing or loading, if any. */
  get playing(): string | null {
    return this.current;
  }

  /**
   * Play a project's song, repeating, until stop() or another song. Resolves
   * true when the song is playing; false when it could not be (superseded by
   * a later request, or the project would not load). A failed song may be
   * asked for again.
   */
  play(channelId: string): Promise<boolean> {
    if (channelId === this.current) {
      return Promise.resolve(true);
    }
    const request = ++this.request;
    this.stopPlayback();
    this.current = channelId;
    const run = () => this.startSong(channelId, request);
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => {});
    return result;
  }

  private async startSong(
    channelId: string,
    request: number
  ): Promise<boolean> {
    if (request !== this.request) {
      return false;
    }
    if (!this.musicPlayer || !this.projectPlayer) {
      ({musicPlayer: this.musicPlayer, projectPlayer: this.projectPlayer} =
        this.createPlayers());
    }
    try {
      await this.projectPlayer.loadProject(channelId);
    } catch (e) {
      this.forget(channelId, request);
      throw e;
    }
    if (request !== this.request) {
      return false;
    }
    const metadata = this.projectPlayer.getMetadata();
    // A project that would not load comes back as Music Lab's built-in
    // metadata: silence, not the built-in song.
    if (metadata.channelId !== channelId) {
      this.forget(channelId, request);
      return false;
    }
    const {playbackEvents, lastMeasure} = metadata;
    this.musicPlayer.setLoopStart(FIRST_MEASURE);
    this.musicPlayer.setLoopEnd(lastMeasure + 1);
    this.musicPlayer.setLoopEnabled(true);
    this.musicPlayer.playSong(playbackEvents);
    return true;
  }

  // Nothing is playing after a failed load; forgetting the channel lets a
  // later request try it again.
  private forget(channelId: string, request: number): void {
    if (request === this.request && this.current === channelId) {
      this.current = null;
    }
  }

  stop(): void {
    this.request++;
    this.stopPlayback();
    this.current = null;
  }

  private stopPlayback(): void {
    if (this.musicPlayer) {
      this.musicPlayer.stopSong();
      this.musicPlayer.setLoopEnabled(false);
    }
  }
}
