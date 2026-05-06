import {useEffect, useRef} from 'react';

import {AppMode} from './oceans/constants';
import {initAll} from './oceans/init';
import Sounds from './oceans/Sounds';

/**
 * @typedef {Object} OceansLabProps
 * @property {string} [appMode] - One of the AppMode values (e.g. 'fishvtrash').
 * @property {string} [guides] - Guide key for the on-screen guide sequence.
 * @property {string} [textToSpeechLocale] - BCP-47 locale for TTS (e.g. 'en').
 * @property {Function} [onContinue] - Callback fired when the user advances.
 */

/**
 * OceansLab mounts the AI for Oceans activity into two canvas elements and
 * calls initAll imperatively. Consumers can pass appMode and onContinue to
 * control which activity runs and what happens when the user completes it.
 *
 * @param {OceansLabProps} props
 */
export default function OceansLab({
  appMode = AppMode.FishVTrash,
  guides,
  textToSpeechLocale,
  onContinue,
}) {
  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const soundsRef = useRef(null);

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
      canvas: canvasRef.current,
      backgroundCanvas: backgroundCanvasRef.current,
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
