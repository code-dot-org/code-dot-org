import {Dispatch, SetStateAction, useCallback, useEffect, useRef} from 'react';

import {UseSourcesOutput} from '@cdo/apps/lab2/hooks/useSources';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import defaultSources from '../defaultSources.json';
import {setActiveTab, Tab} from '../redux/spriteLab2Redux';
import {deleteProjectAsset} from '../sceneThumbnails';
import {Scene, SceneType, Sources} from '../types';

interface SceneEditingOptions {
  scenes: Scene[];
  activeSceneId: string | null;
  setActiveSceneId: Dispatch<SetStateAction<string | null>>;
  activeTab: Tab;
  channelId: string | undefined;
  updateSources: UseSourcesOutput<Sources>['updateSources'];
  getScenes: (sources: Sources) => Scene[];
}

export interface SceneEditing {
  /** Make the scene current; from outside the scene tabs, also return to
      the scene tab last edited in (World only if the scene has one). */
  selectScene: (sceneId: string) => void;
  createScene: (name: string, type: SceneType) => void;
  renameScene: (sceneId: string, name: string) => void;
  /** Never the last scene (the gallery offers no delete for it). */
  deleteScene: (sceneId: string) => void;
  /** Move the scene to index 0, where Play and other projects' jumps
      start. */
  makeStartScene: (sceneId: string) => void;
  openGallery: () => void;
}

/** The scene list's edits: select, create, rename, delete, reorder. */
export default function useSceneEditing({
  scenes,
  activeSceneId,
  setActiveSceneId,
  activeTab,
  channelId,
  updateSources,
  getScenes,
}: SceneEditingOptions): SceneEditing {
  const dispatch = useAppDispatch();

  const lastSceneTabRef = useRef<Tab>('Code');
  useEffect(() => {
    if (activeTab === 'Code' || activeTab === 'World') {
      lastSceneTabRef.current = activeTab;
    }
  }, [activeTab]);

  const selectScene = useCallback(
    (sceneId: string) => {
      const scene = scenes.find(s => s.id === sceneId);
      if (!scene) {
        return;
      }
      setActiveSceneId(sceneId);
      if (activeTab !== 'Code' && activeTab !== 'World') {
        const target =
          lastSceneTabRef.current === 'World' && scene.type !== 'story'
            ? 'World'
            : 'Code';
        dispatch(setActiveTab(target));
      }
    },
    [scenes, activeTab, setActiveSceneId, dispatch]
  );

  const createScene = useCallback(
    (name: string, type: SceneType) => {
      const scene: Scene = {
        id: createUuid(),
        name,
        type,
        source: defaultSources.source,
      };
      updateSources(prev => ({...prev, scenes: [...getScenes(prev), scene]}));
      // Both state updates land in one commit, so the reconcile effect
      // sees the new scene in the derived list.
      setActiveSceneId(scene.id);
    },
    [updateSources, getScenes, setActiveSceneId]
  );

  const renameScene = useCallback(
    (sceneId: string, name: string) => {
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).map(s => (s.id === sceneId ? {...s, name} : s)),
      }));
    },
    [updateSources, getScenes]
  );

  // A go-to-scene block naming the deleted scene falls back to its
  // dropdown's first option.
  const deleteScene = useCallback(
    (sceneId: string) => {
      const doomed = scenes.find(s => s.id === sceneId);
      const remaining = scenes.filter(s => s.id !== sceneId);
      if (!doomed || remaining.length === 0) {
        return;
      }
      if (activeSceneId === sceneId) {
        setActiveSceneId(remaining[0].id);
      }
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).filter(s => s.id !== sceneId),
      }));
      deleteProjectAsset(channelId, doomed.thumbnail?.url);
    },
    [
      scenes,
      activeSceneId,
      setActiveSceneId,
      updateSources,
      getScenes,
      channelId,
    ]
  );

  const makeStartScene = useCallback(
    (sceneId: string) => {
      updateSources(prev => {
        const all = getScenes(prev);
        const chosen = all.find(s => s.id === sceneId);
        return chosen
          ? {...prev, scenes: [chosen, ...all.filter(s => s !== chosen)]}
          : prev;
      });
    },
    [updateSources, getScenes]
  );

  const openGallery = useCallback(() => {
    dispatch(setActiveTab('Scenes'));
  }, [dispatch]);

  return {
    selectScene,
    createScene,
    renameScene,
    deleteScene,
    makeStartScene,
    openGallery,
  };
}
