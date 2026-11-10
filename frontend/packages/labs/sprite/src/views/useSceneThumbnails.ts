import {type RefObject, useCallback, useEffect, useRef} from 'react';

import type {SpriteLabEngine} from '../engine/Engine';
import type {UploadImageFunction} from '../projectAssets';
import store from '../redux/store';
import {
  canvasToPngBytes,
  copyFrame,
  deleteProjectAsset,
  sceneFingerprint,
  THUMBNAIL_QUIET_MS,
  thumbnailFileName,
} from '../sceneThumbnails';
import type {Scene, Sources} from '../types';

interface SceneThumbnailsOptions {
  engineRef: RefObject<SpriteLabEngine | null>;
  scenes: Scene[];
  /** Without a channel (a level edit mode) no picture is taken: the upload
      would land elsewhere. */
  channelId: string | undefined;
  uploadImage: UploadImageFunction | undefined;
  updateSources: (update: (prev: Sources) => Sources) => void;
  getScenes: (sources: Sources) => Scene[];
  enabled: boolean;
}

interface PendingThumbnail {
  sceneId: string;
  fingerprint: string;
  frame: HTMLCanvasElement;
}

/**
 * Scene pictures. Every run's first frame is copied (cheap); the copy is
 * kept only once the scene has held still for THUMBNAIL_QUIET_MS, and only
 * if the scene differs from the one its stored picture shows. Returns the
 * function to call before starting the run whose first frame should be the
 * picture.
 */
export default function useSceneThumbnails({
  engineRef,
  scenes,
  channelId,
  uploadImage,
  updateSources,
  getScenes,
  enabled,
}: SceneThumbnailsOptions): (sceneId: string) => void {
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;
  const pending = useRef<PendingThumbnail | null>(null);
  const timer = useRef<number | undefined>(undefined);
  // The scene whose run the pending capture belongs to. A capture that never
  // got a run resolves at the next run's first frame, which is some other
  // scene's picture.
  const capturingSceneRef = useRef<string | null>(null);
  const active = enabled && !!channelId && !!uploadImage;

  const commit = useCallback(async () => {
    const capture = pending.current;
    pending.current = null;
    if (!capture || !channelId || !uploadImage) {
      return;
    }
    const scene = scenesRef.current.find(s => s.id === capture.sceneId);
    // Edited again while we waited: the run that followed armed its own
    // capture, so this one is stale.
    if (
      !scene ||
      sceneFingerprint(scene, store.getState().animationList) !==
        capture.fingerprint
    ) {
      return;
    }
    try {
      const bytes = await canvasToPngBytes(capture.frame);
      const url = await uploadImage(
        thumbnailFileName(scene.id, capture.fingerprint),
        bytes,
        'image/png',
      );
      const previous = scene.thumbnail?.url;
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).map(s =>
          s.id === scene.id
            ? {...s, thumbnail: {url, fingerprint: capture.fingerprint}}
            : s,
        ),
      }));
      if (previous !== url) {
        deleteProjectAsset(channelId, previous);
      }
    } catch (e) {
      // Best effort; the next quiet moment tries again.
      console.warn('Scene thumbnail not saved', e);
    }
  }, [channelId, uploadImage, updateSources, getScenes]);

  const requestThumbnail = useCallback(
    (sceneId: string) => {
      const engine = engineRef.current;
      if (!engine || !active) {
        return;
      }
      capturingSceneRef.current = sceneId;
      engine.captureFirstFrame(stage => {
        if (!stage || capturingSceneRef.current !== sceneId) {
          return;
        }
        const scene = scenesRef.current.find(s => s.id === sceneId);
        if (!scene) {
          return;
        }
        const fingerprint = sceneFingerprint(
          scene,
          store.getState().animationList,
        );
        if (scene.thumbnail?.fingerprint === fingerprint) {
          return;
        }
        pending.current = {sceneId, fingerprint, frame: copyFrame(stage)};
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(commit, THUMBNAIL_QUIET_MS);
      });
    },
    [engineRef, active, commit],
  );

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      pending.current = null;
    },
    [],
  );

  return requestThumbnail;
}
