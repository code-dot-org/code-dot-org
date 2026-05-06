import {useEffect, useRef} from 'react';

import {AppMode, type AppModeValue} from './oceans/constants';
import {initAll} from './oceans/init';
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
  const soundsRef = useRef<InstanceType<typeof Sounds> | null>(null);

  useEffect(() => {
    // MUI's CssBaseline (or any consumer's global reset) sets
    // `*, *::before, *::after { box-sizing: border-box }` which collapses
    // Radium %-based height/padding inside #container-react. Reset to
    // content-box so inline-style percentages resolve identically to the
    // curriculum path where Rails pages default to content-box.
    const style = document.createElement('style');
    style.textContent =
      '#container-react, #container-react * { box-sizing: content-box; }';
    document.head.appendChild(style);

    if (!soundsRef.current) {
      soundsRef.current = new Sounds();
    }
    const sounds = soundsRef.current;

    initAll({
      appMode,
      guides,
      textToSpeechLocale,
      onContinue,
      canvas: canvasRef.current as HTMLCanvasElement,
      backgroundCanvas: backgroundCanvasRef.current as HTMLCanvasElement,
      playSound: sounds.play.bind(sounds),
      registerSound: sounds.register.bind(sounds),
    });

    return () => {
      document.head.removeChild(style);
    };
  }, [appMode, guides, textToSpeechLocale, onContinue]);

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
          id="container-react"
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
