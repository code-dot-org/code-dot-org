import {useCallback, useEffect, useRef, useState} from 'react';

import {MusicProjectOption} from '../redux/spriteLab2Redux';
import SceneMusic from '../sceneMusic';

interface NowPlaying {
  channel: string;
  /** Loading until the song is heard. */
  loading: boolean;
}

/**
 * The game's background music: plays only while `playing`, stops when that
 * ends or the lab unmounts, and plays only a song on the list.
 */
export default function useSceneMusic(
  playing: boolean,
  songs: MusicProjectOption[]
) {
  const musicRef = useRef<SceneMusic | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  // The engine calls playMusic from a handler wired once; it reads the live
  // values through refs.
  const playingRef = useRef(playing);
  const songsRef = useRef(songs);
  useEffect(() => {
    playingRef.current = playing;
    songsRef.current = songs;
  }, [playing, songs]);

  useEffect(() => {
    if (!playing) {
      musicRef.current?.stop();
      setNowPlaying(null);
    }
  }, [playing]);
  useEffect(() => () => musicRef.current?.stop(), []);

  const playMusic = useCallback((channel: string) => {
    // An unavailable placeholder, or a song the list never had, plays nothing.
    const song = songsRef.current.find(p => p.channel === channel);
    if (!playingRef.current || !song || song.unavailable) {
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
        if (started) {
          setNowPlaying({channel, loading: false});
        }
      })
      .catch(e => {
        console.warn('music could not play', e);
        setNowPlaying(current =>
          current?.channel === channel ? null : current
        );
      });
  }, []);

  const title = nowPlaying
    ? songs.find(p => p.channel === nowPlaying.channel)?.name || 'Music'
    : null;
  return {nowPlaying, title, playMusic};
}
