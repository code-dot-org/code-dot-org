import {useCallback, useEffect, useRef, useState} from 'react';

import {MusicProjectOption} from '../redux/spriteLab2Redux';
import SceneMusic from '../sceneMusic';

interface NowPlaying {
  channel: string;
  /** Loading until the song is heard. */
  loading: boolean;
}

interface NamedNowPlaying extends NowPlaying {
  /** Display name; "Music" when the list cannot name the song. */
  title: string;
}

/**
 * The game's background music. The caller starts a song with playMusic and
 * ends it with stopMusic (the hook also stops on unmount); when to allow
 * either is the caller's decision. Any song a block names may play — a
 * saved project's music works for whoever can view it, not only its
 * author — and one that will not load clears quietly.
 */
export default function useSceneMusic(songs: MusicProjectOption[]) {
  const musicRef = useRef<SceneMusic | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  useEffect(() => () => musicRef.current?.stop(), []);

  const playMusic = useCallback((channel: string) => {
    if (!channel) {
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

  const stopMusic = useCallback(() => {
    musicRef.current?.stop();
    setNowPlaying(null);
  }, []);

  // A placeholder's label is not a name; a playing song the list cannot
  // name is simply "Music".
  let named: NamedNowPlaying | null = null;
  if (nowPlaying) {
    const listed = songs.find(p => p.channel === nowPlaying.channel);
    const name = listed && !listed.unavailable ? listed.name : null;
    named = {...nowPlaying, title: name || 'Music'};
  }
  return {nowPlaying: named, playMusic, stopMusic};
}
