import {useEffect} from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import MusicLibrary from '../../player/MusicLibrary';
import MusicPlayer from '../../player/MusicPlayer';
import {setBpm, setKey} from '../../redux/musicRedux';

/**
 * A hook for updating the {@link MusicPlayer} when relevant redux state changes.
 */
export default function useUpdatePlayer(player: MusicPlayer) {
  const bpm = useAppSelector(state => state.music.bpm);
  const key = useAppSelector(state => state.music.key);
  const loopEnabled = useAppSelector(state => state.music.loopEnabled);
  const loopStart = useAppSelector(state => state.music.loopStart);
  const loopEnd = useAppSelector(state => state.music.loopEnd);
  const startingPlayheadPosition = useAppSelector(
    state => state.music.startingPlayheadPosition
  );
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const packId = useAppSelector(state => state.music.packId);

  const dispatch = useAppDispatch();
  const library = MusicLibrary.getInstance();

  useEffect(() => {
    player.setBpm(bpm);
  }, [player, bpm]);

  useEffect(() => {
    player.setKey(key);
  }, [player, key]);

  useEffect(() => {
    if (!library) {
      return;
    }
    const bpm = library.getBPM();
    const key = library.getKey();
    if (bpm !== undefined) {
      dispatch(setBpm(bpm));
    }
    if (key !== undefined) {
      dispatch(setKey(key));
    }
    // Update BPM and key whenever current pack ID changes.
  }, [library, dispatch, packId]);

  useEffect(() => {
    player.setLoopEnabled(loopEnabled);
  }, [player, loopEnabled]);

  useEffect(() => {
    player.setLoopStart(loopStart);
  }, [player, loopStart]);

  useEffect(() => {
    player.setLoopEnd(loopEnd);
  }, [player, loopEnd]);

  useEffect(() => {
    if (isPlaying) {
      player.jumpToPosition(startingPlayheadPosition);
    }
  }, [player, startingPlayheadPosition, isPlaying]);
}
