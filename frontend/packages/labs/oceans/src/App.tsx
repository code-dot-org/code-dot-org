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
  }, [appMode, guides, textToSpeechLocale, onContinue]);

  return (
    <div
      id="container-react"
      style={{position: 'relative', width: 1024, height: 576}}
    >
      <canvas
        id="background-canvas"
        ref={backgroundCanvasRef}
        style={{position: 'absolute', top: 0, left: 0}}
      />
      <canvas
        id="activity-canvas"
        ref={canvasRef}
        style={{position: 'absolute', top: 0, left: 0}}
      />
    </div>
  );
}
