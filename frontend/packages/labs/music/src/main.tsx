import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Import code.org brand fonts (Figtree, Noto Sans, Barlow)
import '@code-dot-org/fonts/brands/code.org/index.css';

// Import component library root CSS variables (colors, primitives, etc.)
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

// Load Font Awesome Pro 6 icons from CDN
import {injectFontAwesome} from '@code-dot-org/fonts';

import {LevelKind} from '@code-dot-org/api/models/levels';
import type {LevelProperties} from '@code-dot-org/lab';

injectFontAwesome();

// Import lab CSS variables (borders, z-indices, etc.)
import '@code-dot-org/lab/styles/variables.scss';

import App from './App.tsx';

const _mockLevelProperties: LevelProperties = {
  id: 1,
  appName: 'music',
  key: 'music-lab-demo',
  url: '/music-lab-demo',
  longInstructions: 'This is a demo of music lab within a vite application',
  type: 'music',
  kind: LevelKind.activity,
  offerBrowserTts: true,
  levelData: {
    allowChangeStartingPlayheadPosition: true,
    library: 'launch2024',
  },
};

const channelId = window.location.pathname.match(
  /^\/app\/projects\/music\/([^/]+)\/edit$/,
)?.[1];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App levelId={'62733'} channelId={channelId} isLoading={false} />
  </StrictMode>,
);
