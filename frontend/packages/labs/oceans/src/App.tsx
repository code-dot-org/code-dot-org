import {useCallback, useEffect, useRef} from 'react';

import {
  AppMode,
  type AppModeValue,
  OCEANS_UI_CONTAINER_ID,
} from './oceans/constants';
import {initAll, stopUIRerender} from './oceans/init';
import Sounds from './oceans/Sounds';

/** Props for the OceansLab React component. */
export interface OceansLabProps {
  /** One of the AppMode values (e.g. 'fishvtrash'). Defaults to FishVTrash. */
  appMode?: AppModeValue;
  /** Guide key for the on-screen guide sequence (e.g. 'K5'). */
  guides?: string;
  /** BCP-47 locale for text-to-speech (e.g. 'en'). */
  textToSpeechLocale?: string;
  /** Called when the user advances past the current activity. */
  onContinue?: () => void;
}

/**
 * OceansLab mounts the AI for Oceans activity into two canvas elements and
 * calls initAll imperatively. Consumers can pass appMode and onContinue to
 * control which activity runs and what happens when the user completes it.
 */
export default function OceansLab({
  appMode = AppMode.FishVTrash,
  guides,
  textToSpeechLocale,
  onContinue,
}: OceansLabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  // Sounds is exported from a `@ts-nocheck` module (PR 1 verbatim) so it
  // surfaces as `any`; pin the ref through the constructable form.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const soundsRef = useRef<any>(null);

  // Stable ref so onContinue identity changes never retrigger initAll.
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  // Wrapper with a stable identity for the initAll dependency array.
  const stableOnContinue = useCallback(() => {
    onContinueRef.current?.();
  }, []);

  useEffect(() => {
    if (!soundsRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      soundsRef.current = new (Sounds as any)();
    }
    const sounds = soundsRef.current;

    initAll({
      appMode,
      guides,
      textToSpeechLocale,
      onContinue: stableOnContinue,
      canvas: canvasRef.current as HTMLCanvasElement,
      backgroundCanvas: backgroundCanvasRef.current as HTMLCanvasElement,
      playSound: sounds.play.bind(sounds),
      registerSound: sounds.register.bind(sounds),
    });

    // Stop the canvas RAF loop on cleanup, but leave the React UI root alive.
    // Unmounting the root here triggers React's "synchronously unmount during
    // render" warning under StrictMode's double-invoke cycle — the deferred
    // unmount then clears the container after the second initAll, leaving the
    // UI empty. The root is safely orphaned when the container DOM node is
    // removed on true component unmount.
    return stopUIRerender;
  }, [appMode, guides, textToSpeechLocale, stableOnContinue]);

  // 16:9 responsive wrapper — padding-top 56.25% creates the aspect-ratio box.
  // Canvas JS resolution is set to 1024×576 by initAll; CSS width/height 100%
  // scales them to fill whatever space the studio (or any other consumer) gives us.
  return (
    <div style={{width: '100%', position: 'relative', paddingTop: '56.25%'}}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <canvas
          id="background-canvas"
          ref={backgroundCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 10,
          }}
        />
        <canvas
          id="activity-canvas"
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 10,
          }}
        />
        {/*
         * renderUI() in init.tsx mounts a second React root here via createRoot.
         * Must be a sibling of the canvases — createRoot evicts all existing
         * children of its container, so nesting canvases inside would remove
         * them from the DOM on first render.
         */}
        <div
          id={OCEANS_UI_CONTAINER_ID}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
}
