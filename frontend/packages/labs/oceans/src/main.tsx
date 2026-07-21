import {useState} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';

import OceansLab from './App';
import {AppMode, type AppModeValue} from './oceans/constants';
// Frame sizing (proportional font-size + 16:9 width clamp).  The studio host
// opts into this same file; the dev harness must too, or it renders at a flat
// 16 px base and diverges from the curriculum path.
import './oceans/styles/oceansLab.css';

initializeCore({plugins: [localizationPlugin]});

/** All playable modes in sequence, used by the mode picker and onContinue handler. */
const APP_MODES: {id: AppModeValue; label: string}[] = [
  {id: AppMode.FishVTrash, label: 'Fish vs Trash'},
  {id: AppMode.FishShort, label: 'Fish Short'},
  {id: AppMode.FishLong, label: 'Fish Long'},
  {id: AppMode.CreaturesVTrash, label: 'Creatures vs Trash'},
  {id: AppMode.CreaturesVTrashDemo, label: 'Creatures Demo'},
];

/** Read initial mode from ?mode= URL param, fallback to FishVTrash. */
function getInitialMode(): AppModeValue {
  const params = new URLSearchParams(window.location.search);
  return (params.get('mode') as AppModeValue) || AppMode.FishVTrash;
}

/**
 * Dev harness that mirrors a real host application's OceansLab embedding.
 *
 * Layout matches the studio OceansContainer:
 *   - Full-viewport dark blue background.
 *   - OceansLab centred horizontally, sized to a 16:9 aspect ratio.
 *   - content-box sizing reset for #container-react (matches the curriculum
 *     path's Rails defaults; the studio applies the same reset).
 *
 * A compact mode-picker and URL-param support (?mode=, ?guides=, ?tts=) are
 * added for local development and Playwright testing without changing the
 * dimensions or box-model of the embedded lab.
 */
function DemoShell() {
  const [appMode, setAppMode] = useState<AppModeValue>(getInitialMode);
  const params = new URLSearchParams(window.location.search);

  /** Advance to next mode in APP_MODES sequence when the user completes one. */
  function handleContinue() {
    const idx = APP_MODES.findIndex(m => m.id === appMode);
    const next = APP_MODES[idx + 1];
    if (next) {
      setAppMode(next.id);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'rgb(2, 0, 28)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Mode picker — kept small so it doesn't affect the lab's dimensions */}
      <div
        style={{
          flexShrink: 0,
          padding: '6px 10px',
          fontSize: 12,
          opacity: 0.7,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 12px',
        }}
      >
        {APP_MODES.map(m => (
          <label key={m.id} style={{cursor: 'pointer', whiteSpace: 'nowrap'}}>
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

      {/* Lab area — mirrors the studio OceansContainer exactly: same shell /
          frame classes, so the proportional font-size and 16:9 width clamp
          match the curriculum path. */}
      <div className="oceans-lab-shell">
        <div className="oceans-lab-frame">
          <OceansLab
            appMode={appMode}
            guides={params.get('guides') ?? undefined}
            textToSpeechLocale={params.get('tts') ?? undefined}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<DemoShell />);
