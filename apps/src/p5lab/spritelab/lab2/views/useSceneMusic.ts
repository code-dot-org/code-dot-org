import {useCallback, useEffect, useRef, useState} from 'react';

import {MusicProjectOption} from '../redux/spriteLab2Redux';
import SceneMusic from '../sceneMusic';

interface NowPlaying {
  channel: string;
  /** Loading until the song is heard. */
  loading: boolean;
}

/**
 * The game's background music: plays only while `playing`, and stops when
 * that ends or the lab unmounts. Any song a block names may play — a saved
 * project's music works for whoever can view it, not only its author — and
 * one that will not load clears quietly.
 */
export default function useSceneMusic(
  playing: boolean,
  songs: MusicProjectOption[]
) {
  const musicRef = useRef<SceneMusic | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  // Read through a ref so the callback identity stays stable.
  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      musicRef.current?.stop();
      setNowPlaying(null);
    }
  }, [playing]);
  useEffect(() => () => musicRef.current?.stop(), []);

  const playMusic = useCallback((channel: string) => {
    if (!playingRef.current || !channel) {
      return;
    }
    const music = (musicRef.current ||= new SceneMusic());
    if (music.playing === channel) {
      return;
    }
    setNowPlaying({channel, loading: true});
    music
      .play(channel)
      .then(started => {
        setNowPlaying(current => {
          if (current?.channel !== channel) {
            return current;
          }
          return started ? {channel, loading: false} : null;
        });
      })
      .catch(e => {
        console.warn('music could not play', e);
        setNowPlaying(current =>
          current?.channel === channel ? null : current
        );
      });
  }, []);

  // A placeholder's label is not a name; a playing song the list cannot
  // name is simply "Music".
  const listed = nowPlaying
    ? songs.find(p => p.channel === nowPlaying.channel)
    : undefined;
  const title = nowPlaying
    ? (!listed?.unavailable && listed?.name) || 'Music'
    : null;
  return {nowPlaying, title, playMusic};
}
