import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Channel} from '../lab2/types';
import MusicPlayer from './player/MusicPlayer';
import MusicBlocklyWorkspace from './blockly/MusicBlocklyWorkspace';
import Simple2Sequencer from './player/sequencer/Simple2Sequencer';
import {RemoteSourcesStore, SourcesStore} from '../lab2/projects/SourcesStore';
import {loadLibrary} from './utils/Loader';
import MusicLibrary from './player/MusicLibrary';
import {Triggers} from './constants';
import {PlaybackEvent} from './player/interfaces/PlaybackEvent';

interface MiniPlayerViewProps {
  projects: Channel[];
  libraryName: string;
}

const MiniPlayerView: React.FunctionComponent<MiniPlayerViewProps> = ({
  projects,
  libraryName,
}) => {
  const playerRef = useRef<MusicPlayer>(new MusicPlayer());
  const workspaceRef = useRef<MusicBlocklyWorkspace>(
    new MusicBlocklyWorkspace()
  );
  const sequencerRef = useRef<Simple2Sequencer>(new Simple2Sequencer());
  const sourcesStoreRef = useRef<SourcesStore>(new RemoteSourcesStore());
  const [isLoading, setIsLoading] = useState(true);

  // Setup library and workspace on mount
  const onMount = useCallback(async () => {
    workspaceRef.current.initHeadless();
    const library = await loadLibrary(libraryName);
    MusicLibrary.setCurrent(library);
    setIsLoading(false);
  }, [libraryName]);

  useEffect(() => {
    onMount();
  }, [onMount]);

  // This is the main function that is called when a song is played in the mini player
  // Loads code from the server, compiles the song, executes it to generate events,
  // and then plays the events.
  // Optimization: cache code and/or compiled song after played once.
  const onPlaySong = useCallback(async (project: Channel) => {
    // Load code
    const code = await sourcesStoreRef.current.load(project.id);
    workspaceRef.current.loadCode(JSON.parse(code.source));

    // Compile song
    workspaceRef.current.compileSong({Sequencer: sequencerRef.current});

    // Execute compiled song

    // *** NOTE: this below chunk of code (sequencing out all triggers and events) is
    // somewhat copied from MusicView and could be factored out

    // Sequence out all possible trigger events to preload sounds if necessary.
    const allTriggerEvents: PlaybackEvent[] = [];
    Triggers.forEach(trigger => {
      sequencerRef.current.clear();
      workspaceRef.current.executeTrigger(trigger.id, 0);
      allTriggerEvents.push(...sequencerRef.current.getPlaybackEvents());
    });

    sequencerRef.current.clear();
    workspaceRef.current.executeCompiledSong();

    // Preload sounds in player
    playerRef.current.preloadSounds(
      [...allTriggerEvents, ...sequencerRef.current.getPlaybackEvents()],
      () => {
        // TODO: Metrics reporting if necessary
      }
    );

    // Play sounds
    playerRef.current.playSong(sequencerRef.current.getPlaybackEvents());
  }, []);

  // Some loading UI while we're fetching the library
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Bare bones render function to hook things together
  return (
    <div>
      {projects.map(project => {
        return (
          <button
            type="button"
            key={project.id}
            onClick={() => onPlaySong(project)}
          >
            Play! {project.name}
          </button>
        );
      })}
    </div>
  );
};

export default MiniPlayerView;
