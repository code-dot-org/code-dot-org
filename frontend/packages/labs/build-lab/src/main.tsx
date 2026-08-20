import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';

import '@code-dot-org/component-library-styles/brandOverrides.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';

import BuildLab from './BuildLab';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BuildLab />
  </StrictMode>,
);
