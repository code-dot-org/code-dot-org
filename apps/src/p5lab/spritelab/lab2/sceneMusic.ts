import MusicPlayer from '@cdo/apps/music/player/MusicPlayer';
import ProjectPlayer from '@cdo/apps/music/ProjectPlayer';

// The first measure of a song; playback positions are 1-based measures.
const FIRST_MEASURE = 1;

/** Music Lab's players; its Blockly setup runs with the first one. */
export function createMusicPlayers(): {
  musicPlayer: MusicPlayer;
  projectPlayer: ProjectPlayer;
} {
  const musicPlayer = new MusicPlayer();
  return {musicPlayer, projectPlayer: new ProjectPlayer(musicPlayer)};
}

/**
 * Background music for a game: one Music Lab project at a time, repeating
 * from its first measure to its last. Asking for the song already playing
 * changes nothing, so a scene jump within the same music carries on
 * uninterrupted. The player and the Music Lab Blockly setup behind it are
 * created on the first song, since most games have none.
 */
export default class SceneMusic {
  private musicPlayer: MusicPlayer | null = null;
  private projectPlayer: ProjectPlayer | null = null;
  private current: string | null = null;
  private request = 0;

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
   * when the song is playing; false when a later request superseded it.
   */
  async play(channelId: string): Promise<boolean> {
    if (channelId === this.current) {
      return true;
    }
    const request = ++this.request;
    this.stopPlayback();
    this.current = channelId;
    if (!this.musicPlayer || !this.projectPlayer) {
      ({musicPlayer: this.musicPlayer, projectPlayer: this.projectPlayer} =
        this.createPlayers());
    }
    await this.projectPlayer.loadProject(channelId);
    if (request !== this.request) {
      return false;
    }
    const {playbackEvents, lastMeasure} = this.projectPlayer.getMetadata();
    this.musicPlayer.setLoopStart(FIRST_MEASURE);
    this.musicPlayer.setLoopEnd(lastMeasure + 1);
    this.musicPlayer.setLoopEnabled(true);
    this.musicPlayer.playSong(playbackEvents);
    return true;
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
