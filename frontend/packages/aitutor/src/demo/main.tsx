// The standalone harness: `yarn dev` serves this.
//
// NOT part of the library build — the lib entry is `src/index.ts`, and nothing
// there reaches this file. Its whole job is to prove the claim in
// specs/PLAN.md §6: the panel runs with no server, no key and no studio, so
// anyone can review it.
//
// The store is the one `@code-dot-org/core/redux` owns, with this package's
// slice injected — the same thing `labs/base` does, and the same thing a host
// will have to do. If the demo needed something more than that, the package
// would be asking too much of its hosts.

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {StyledEngineProvider, ThemeProvider} from '@mui/material';
import {createRoot} from 'react-dom/client';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {RootStateProvider, injectSlices} from '@code-dot-org/core/redux';
import {injectFontAwesome} from '@code-dot-org/fonts';

import aiTutorSlice from '../session/slice';

import {Demo} from './Demo';

// The design system's icon set, from its CDN. Offline this 404s and the send
// button loses its glyph — cosmetic, and not worth a local copy here.
void injectFontAwesome();

injectSlices([aiTutorSlice]);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={CdoTheme}>
      <RootStateProvider>
        <Demo />
      </RootStateProvider>
    </ThemeProvider>
  </StyledEngineProvider>,
);
