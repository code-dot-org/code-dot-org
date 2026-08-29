import * as BlocklyCore from 'blockly/core';

import MusicBlocklyWorkspace from '@cdo/apps/music/blockly/MusicBlocklyWorkspace';
import MusicPlayer from '@cdo/apps/music/player/MusicPlayer';
import ProjectPlayer from '@cdo/apps/music/ProjectPlayer';

// The first measure of a song; playback positions are 1-based measures.
const FIRST_MEASURE = 1;

// Music Lab's Blockly setup (run when its player is created) defines its own
// blocks over any of the same type this lab has — `when_run`, whose Music
// generator emits a guard on a variable only Music's programs declare. The
// game's blocks keep their definitions; a colliding generator goes to Music's
// version only for blocks in Music's own headless workspace.
const musicWorkspaces = new WeakSet<BlocklyCore.Workspace>();

class TrackedMusicWorkspace extends MusicBlocklyWorkspace {
  initHeadless() {
    super.initHeadless();
    const {workspace} = this as unknown as {
      workspace: BlocklyCore.Workspace | null;
    };
    if (workspace) {
      musicWorkspaces.add(workspace);
    }
  }
}

type BlockGenerator = (
  block: BlocklyCore.Block,
  generator: BlocklyCore.CodeGenerator
) => [string, number] | string | null;

interface BlockRegistry {
  blocks: {[type: string]: unknown};
  generators: {[type: string]: BlockGenerator | undefined};
}

/**
 * After another lab's setup has redefined block types in `registry`, put
 * back the definitions saved in `before` and make each redefined generator
 * choose by workspace: the new one where `isForeign(block.workspace)`, the
 * saved one elsewhere. Types the setup added afresh are left alone.
 */
export function shareRedefinedBlocks(
  registry: BlockRegistry,
  before: BlockRegistry,
  isForeign: (workspace: BlocklyCore.Workspace) => boolean
): string[] {
  const shared: string[] = [];
  Object.keys(before.blocks).forEach(type => {
    if (registry.blocks[type] !== before.blocks[type]) {
      registry.blocks[type] = before.blocks[type];
      shared.push(type);
    }
    const foreign = registry.generators[type];
    const own = before.generators[type];
    if (foreign && own && foreign !== own) {
      registry.generators[type] = (block, generator) =>
        (isForeign(block.workspace) ? foreign : own)(block, generator);
    }
  });
  return shared;
}

function blockRegistry(): BlockRegistry {
  return {
    blocks: Blockly.Blocks,
    generators: Blockly.getGenerator().forBlock as BlockRegistry['generators'],
  };
}

/** Music Lab's players, set up without taking over this lab's blocks. */
export function createMusicPlayers(): {
  musicPlayer: MusicPlayer;
  projectPlayer: ProjectPlayer;
} {
  const registry = blockRegistry();
  const before: BlockRegistry = {
    blocks: {...registry.blocks},
    generators: {...registry.generators},
  };
  const functionPlaceholder = Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE'];
  const musicPlayer = new MusicPlayer();
  const projectPlayer = new ProjectPlayer(
    musicPlayer,
    undefined,
    new TrackedMusicWorkspace()
  );
  shareRedefinedBlocks(registry, before, workspace =>
    musicWorkspaces.has(workspace)
  );
  Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE'] = functionPlaceholder;
  return {musicPlayer, projectPlayer};
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
