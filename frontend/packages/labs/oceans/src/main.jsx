import {useState} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';

import OceansLab from './App';
import {AppMode} from './oceans/constants';

initializeCore({plugins: [localizationPlugin]});

/** All playable modes in sequence, used by the mode picker and onContinue handler. */
const APP_MODES = [
  {id: AppMode.FishVTrash, label: 'Fish vs Trash'},
  {id: AppMode.FishShort, label: 'Fish Short'},
  {id: AppMode.FishLong, label: 'Fish Long'},
  {id: AppMode.CreaturesVTrash, label: 'Creatures vs Trash'},
  {id: AppMode.CreaturesVTrashDemo, label: 'Creatures Demo'},
];

/** Read initial mode from ?mode= URL param, fallback to FishVTrash. */
function getInitialMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') || AppMode.FishVTrash;
}

/** Dev harness: mode picker + OceansLab component. */
function DemoShell() {
  const [appMode, setAppMode] = useState(getInitialMode);
  const params = new URLSearchParams(window.location.search);

  /** Advance to next mode in sequence when the user completes one. */
  function handleContinue() {
    const idx = APP_MODES.findIndex(m => m.id === appMode);
    const next = APP_MODES[idx + 1];
    if (next) {
      setAppMode(next.id);
    }
  }

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
      <OceansLab
        appMode={appMode}
        guides={params.get('guides') ?? undefined}
        textToSpeechLocale={params.get('tts') ?? undefined}
        onContinue={handleContinue}
      />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<DemoShell />);
