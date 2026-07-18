// Standalone dev harness for Python Lab: `yarn dev` serves this. It is NOT part
// of the library build (the lib entry is src/index.ts) — it just mounts the App
// with the provider stack the studio host normally supplies, plus a fixture
// level so the lab renders with no Rails backend.
//
// Run is still a stub (writes a placeholder to the console) until the pyodide
// runtime is ported; everything else — file browser, editor, console — is real.

// Design-system fonts and CSS variables (colors, primitives).
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {GlobalStyles, StyledEngineProvider, ThemeProvider} from '@mui/material';
import {createRoot} from 'react-dom/client';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import type {LevelProperties} from '@code-dot-org/core/api';
import {injectFontAwesome} from '@code-dot-org/fonts';
import {RootStateProvider} from '@code-dot-org/lab';

import App from './App';

injectFontAwesome();

// The base `<Lab>` wraps content in the component-library ThemeProvider's
// `<div data-theme>`, which has no intrinsic height. The studio host sizes labs
// via its own layout CSS; here we make that wrapper (and this harness's own) fill
// the viewport so the lab's flex layout has a height to divide.
const fullHeight = (
  <GlobalStyles
    styles={{
      'div[data-theme]': {height: '100%'},
    }}
  />
);

const rootElement = document.getElementById('root');
if (rootElement) {
  // No <StrictMode>: it double-invokes effects in dev, which races xterm's
  // async render against the console's dispose/remount (a benign 'dimensions'
  // error). The lab's own tests still run under React's strict behavior.
  createRoot(rootElement).render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={CdoTheme}>
        {fullHeight}
        <RootStateProvider>
          <div style={{height: '100vh'}}>
            <App
              isLoading={false}
              levelId="1"
              levelPropertiesMap={{'1': {} as LevelProperties}}
            />
          </div>
        </RootStateProvider>
      </ThemeProvider>
    </StyledEngineProvider>,
  );
}
