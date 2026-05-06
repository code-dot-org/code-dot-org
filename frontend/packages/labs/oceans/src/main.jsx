import {useCallback, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';

import {stopTypingSounds} from './oceans/components/common/Guide';
import {AppMode} from './oceans/constants';
import {initAll} from './oceans/init';
import Sounds from './oceans/Sounds';

initializeCore({plugins: [localizationPlugin]});

const APP_MODES = [
  {id: AppMode.FishVTrash, label: 'Fish vs Trash'},
  {id: AppMode.FishShort, label: 'Fish Short'},
  {id: AppMode.FishLong, label: 'Fish Long'},
  {id: AppMode.CreaturesVTrash, label: 'Creatures vs Trash'},
  {id: AppMode.CreaturesVTrashDemo, label: 'Creatures Demo'},
];

function getInitialMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') || AppMode.FishVTrash;
}

function DemoShell() {
  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const [appMode, setAppMode] = useState(getInitialMode);
  const soundsRef = useRef(null);

  const launch = useCallback(mode => {
    if (!soundsRef.current) {
      soundsRef.current = new Sounds();
    }
    const sounds = soundsRef.current;

    initAll({
      appMode: mode,
      guides: new URLSearchParams(window.location.search).get('guides'),
      textToSpeechLocale: new URLSearchParams(window.location.search).get(
        'tts',
      ),
      onContinue: () => {
        const idx = APP_MODES.findIndex(m => m.id === mode);
        const next = APP_MODES[idx + 1];
        if (next) {
          setAppMode(next.id);
        }
      },
      canvas: canvasRef.current,
      backgroundCanvas: backgroundCanvasRef.current,
      playSound: sounds.play.bind(sounds),
      registerSound: sounds.register.bind(sounds),
    });
  }, []);

  useEffect(() => {
    stopTypingSounds();
    launch(appMode);
  }, [appMode, launch]);

  return (
    <div style={{fontFamily: 'sans-serif', padding: 8}}>
      <div style={{marginBottom: 8}}>
        {APP_MODES.map(m => (
          <label key={m.id} style={{marginRight: 12}}>
            <input
              type="radio"
              name="mode"
              value={m.id}
              checked={appMode === m.id}
              onChange={() => setAppMode(m.id)}
            />{' '}
            {m.label}
          </label>
        ))}
      </div>
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
    </div>
  );
}

createRoot(document.getElementById('root')).render(<DemoShell />);
