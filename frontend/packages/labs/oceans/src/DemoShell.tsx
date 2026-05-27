import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import {useState} from 'react';

import OceansLab from './App';
import {AppMode, type AppModeValue} from './oceans/constants';

/** All playable modes in sequence, used by the mode picker and onContinue handler. */
export const APP_MODES: {id: AppModeValue; label: string}[] = [
  {id: AppMode.FishVTrash, label: 'Fish vs Trash'},
  {id: AppMode.FishShort, label: 'Fish Short'},
  {id: AppMode.FishLong, label: 'Fish Long'},
  {id: AppMode.CreaturesVTrash, label: 'Creatures vs Trash'},
  {id: AppMode.CreaturesVTrashDemo, label: 'Creatures Demo'},
];

/** Read initial mode from ?mode= URL param, fallback to FishVTrash. */
export function getInitialMode(): AppModeValue {
  const params = new URLSearchParams(window.location.search);
  return (params.get('mode') as AppModeValue) || AppMode.FishVTrash;
}

/** Dev harness that embeds OceansLab the way a host page would, with a mode picker and URL params for local iteration. */
export default function DemoShell() {
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

  /** Update appMode when the user picks a different radio. */
  function handleModeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAppMode(event.target.value as AppModeValue);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'rgb(2, 0, 28)',
        color: 'white',
        boxSizing: 'border-box',
      }}
    >
      {/* Skip link — pure anchor; targets the canvas-spanning "Dismiss guide" overlay so Enter dismisses immediately. */}
      <Box
        component="a"
        href="#oceans-guide"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          '&:focus': {
            left: '10px',
            top: '10px',
            padding: '8px 16px',
            backgroundColor: 'white',
            color: 'rgb(2, 0, 28)',
            textDecoration: 'underline',
            zIndex: 1000,
          },
        }}
      >
        Skip to main content
      </Box>
      <FormControl
        component="fieldset"
        sx={{flexShrink: 0, px: '10px', py: '6px', opacity: 0.7}}
      >
        {/* Visually hidden but exposed to assistive tech and tests. */}
        <FormLabel
          component="legend"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
          }}
        >
          Mode
        </FormLabel>
        <RadioGroup
          row
          name="mode"
          value={appMode}
          onChange={handleModeChange}
          sx={{gap: '4px 12px', flexWrap: 'wrap'}}
        >
          {APP_MODES.map(m => (
            <FormControlLabel
              key={m.id}
              value={m.id}
              control={<Radio size="small" sx={{color: 'inherit', p: 0.5}} />}
              label={m.label}
              slotProps={{typography: {fontSize: 12}}}
              sx={{m: 0, whiteSpace: 'nowrap'}}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Lab area — mirrors OceansContainer: centred, capped at 1280 px, 10 px gap. */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: '10px',
          pb: '10px',
          minHeight: 0,
        }}
      >
        <Box sx={{width: '100%', maxWidth: 1280}}>
          <OceansLab
            appMode={appMode}
            guides={params.get('guides') ?? undefined}
            textToSpeechLocale={params.get('tts') ?? undefined}
            onContinue={handleContinue}
          />
        </Box>
      </Box>
    </Box>
  );
}
