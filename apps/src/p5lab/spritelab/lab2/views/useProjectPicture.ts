import {useCallback, useRef} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getStore} from '@cdo/apps/redux';

import {copyFrame, sceneFingerprint} from '../sceneThumbnails';
import SpriteLab2Engine from '../SpriteLab2Engine';
import {Scene} from '../types';

/** The width and height of the project's picture. The older labs save
    theirs 220 pixels wide. */
export const PROJECT_PICTURE_PX = 220;

interface ProjectPictureOptions {
  engineRef: React.RefObject<SpriteLab2Engine | null>;
  scenes: Scene[];
  /** The scene a play starts on. Its first frame is the project's picture. */
  startSceneId: string | null;
  enabled: boolean;
}

/**
 * The project's picture, which the projects list and project cards show: the
 * first frame of the scene a play starts on. Returns the function to call
 * before starting a run.
 *
 * The picture is handed to the project manager, which uploads it with the
 * project's next save, so taking one makes no request of its own. A new
 * picture is taken only when the starting scene differs from the one in the
 * last picture taken on this visit. Only the project's owner takes one, and
 * never from a share link.
 */
export default function useProjectPicture({
  engineRef,
  scenes,
  startSceneId,
  enabled,
}: ProjectPictureOptions): (sceneId: string) => void {
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;
  // The scene of the most recent run that was asked for. A wait for a run
  // that never started is answered by the next run's first frame, which may
  // be another scene's.
  const requestedSceneRef = useRef<string | null>(null);
  const pictureFingerprintRef = useRef<string | null>(null);

  return useCallback(
    (sceneId: string) => {
      requestedSceneRef.current = sceneId;
      const engine = engineRef.current;
      const projectManager = Lab2Registry.getInstance().getProjectManager();
      if (
        !enabled ||
        !engine ||
        sceneId !== startSceneId ||
        !projectManager?.getShouldCaptureThumbnail()
      ) {
        return;
      }
      engine.captureFirstFrame((stage: HTMLCanvasElement | null) => {
        if (!stage || requestedSceneRef.current !== sceneId) {
          return;
        }
        const scene = scenesRef.current.find(s => s.id === sceneId);
        if (!scene) {
          return;
        }
        const fingerprint = sceneFingerprint(
          scene,
          getStore().getState().animationList
        );
        if (fingerprint === pictureFingerprintRef.current) {
          return;
        }
        pictureFingerprintRef.current = fingerprint;
        copyFrame(stage, PROJECT_PICTURE_PX).toBlob(pngBlob => {
          // A later picture may have been taken while this one was encoded.
          if (pngBlob && pictureFingerprintRef.current === fingerprint) {
            projectManager.setThumbnail(pngBlob);
          }
        }, 'image/png');
      });
    },
    [engineRef, enabled, startSceneId]
  );
}
