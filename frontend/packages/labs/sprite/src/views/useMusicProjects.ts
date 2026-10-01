// The play-music block's songs, fetched once per level into the store.
import {useEffect, useRef, useState} from 'react';

import {
  collectSavedSongs,
  fetchMusicProjects,
  withUnavailableSongs,
} from '../musicProjects';
import {setMusicProjects} from '../redux/spriteLab2Redux';
import {useAppDispatch} from '../redux/store';
import type {Scene} from '../types';

import {LIST_FETCH_TIMEOUT_MS} from './useExternalScenes';

/**
 * Keeps the store's song list. Returns whether a workspace may load: not
 * before the list, if a saved block names a song, since Blockly checks the
 * saved value against the list as the block loads.
 */
export default function useMusicProjects({
  levelId,
  scenes,
}: {
  levelId: number | string | undefined;
  scenes: Scene[];
}): boolean {
  const dispatch = useAppDispatch();
  const [listReady, setListReady] = useState(false);
  // Read, not followed: an edit must not cancel the first fetch.
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;

  useEffect(() => {
    if (levelId === undefined) {
      return;
    }
    let cancelled = false;
    const savedSongs = collectSavedSongs(scenesRef.current);
    const fetching = fetchMusicProjects().catch(error => {
      console.warn('music projects unavailable', error);
      return [];
    });
    if (savedSongs.length === 0) {
      setListReady(true);
      fetching.then(projects => {
        if (!cancelled) {
          dispatch(setMusicProjects(projects));
        }
      });
    } else {
      setListReady(false);
      const timeout = new Promise<[]>(resolve =>
        window.setTimeout(() => resolve([]), LIST_FETCH_TIMEOUT_MS),
      );
      Promise.race([fetching, timeout]).then(projects => {
        if (!cancelled) {
          dispatch(
            setMusicProjects(withUnavailableSongs(projects, savedSongs)),
          );
          setListReady(true);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [levelId, dispatch]);

  return listReady;
}
