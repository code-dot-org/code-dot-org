import React, {useEffect, useMemo} from 'react';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {MusicState, setBpm, setKey} from '../redux/musicRedux';
import MusicPlayer from '../player/MusicPlayer';
import MusicLibrary from '../player/MusicLibrary';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

const useTypedSelector: TypedUseSelectorHook<{music: MusicState}> = useSelector;

interface PlayerUpdateProps {
  player: MusicPlayer;
}

const PlayerUpdater: React.FunctionComponent<PlayerUpdateProps> = ({
  player,
}) => {
  const bpm = useTypedSelector(state => state.music.bpm);
  const key = useTypedSelector(state => state.music.key);
  const loopEnabled = useTypedSelector(state => state.music.loopEnabled);
  const loopStart = useTypedSelector(state => state.music.loopStart);
  const loopEnd = useTypedSelector(state => state.music.loopEnd);

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
    if (bpm) {
      dispatch(setBpm(bpm));
    }
    if (key) {
      dispatch(setKey(key));
    }
  }, [library, dispatch]);

  useEffect(() => {
    player.setLoopEnabled(loopEnabled);
  }, [player, loopEnabled]);

  useEffect(() => {
    player.setLoopStart(loopStart);
  }, [player, loopStart]);

  useEffect(() => {
    player.setLoopEnd(loopEnd);
  }, [player, loopEnd]);

  return null;
};

export default PlayerUpdater;
