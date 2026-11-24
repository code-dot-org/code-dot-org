import {useCallback, useRef} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getStore} from '@cdo/apps/redux';

import {copyFrame, sceneFingerprint} from '../sceneThumbnails';
import SpriteLab2Engine from '../SpriteLab2Engine';
import {Scene} from '../types';

/** The width and height of the project's picture. The older labs save
    theirs 220 pixels wide. */
export const PROJECT_PICTURE_PX = 220;

const BYTES_PER_PIXEL = 4;

/** Whether every pixel is the same color, as the stage of a scene with
    nothing on it is. */
export function isOneColor(pixels: ArrayLike<number>): boolean {
  for (let i = BYTES_PER_PIXEL; i < pixels.length; i++) {
    // Each byte is compared with the same channel of the first pixel.
    if (pixels[i] !== pixels[i % BYTES_PER_PIXEL]) {
      return false;
    }
  }
  return true;
}

interface ProjectPictureOptions {
  engineRef: React.RefObject<SpriteLab2Engine | null>;
  scenes: Scene[];
  /** The scene a play starts on. Its first frame is the project's picture. */
  startSceneId: string | null;
  enabled: boolean;
}

/**
 * The project's picture: the first frame of the scene a play starts on.
 * Returns the function to call before starting a run.
 *
 * The project manager uploads the picture with the project's next save. A
 * new one is taken only when the starting scene differs from the one in the
 * last picture taken on this visit. A frame of one flat color is not kept,
 * so a project with an empty starting scene keeps the default art.
 */
export default function useProjectPicture({
  engineRef,
  scenes,
  startSceneId,
  enabled,
}: ProjectPictureOptions): (sceneId: string) => void {
  // Read through refs, so the returned function stays the same one.
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;
  const startSceneIdRef = useRef(startSceneId);
  startSceneIdRef.current = startSceneId;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
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
        !enabledRef.current ||
        !engine ||
        sceneId !== startSceneIdRef.current ||
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
        const picture = copyFrame(stage, PROJECT_PICTURE_PX);
        const pixels = picture
          .getContext('2d')
          ?.getImageData(0, 0, picture.width, picture.height).data;
        if (!pixels || isOneColor(pixels)) {
          return;
        }
        picture.toBlob(pngBlob => {
          // A later picture may have been taken while this one was encoded.
          if (pngBlob && pictureFingerprintRef.current === fingerprint) {
            projectManager.setThumbnail(pngBlob);
          }
        }, 'image/png');
      });
    },
    [engineRef]
  );
}
