// The package's own dev server. The lab needs a host's <Lab> (level,
// project, providers), which Studio supplies: run it there, at
// /projects/sprite/simple/edit with VITE_API_MODE=msw. The engine runs on
// its own in engine-demo.html.
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main>
      <h1>Sprite Lab</h1>
      <p>
        The lab runs in Studio: start it with <code>VITE_API_MODE=msw</code> and
        open <code>/projects/sprite/simple/edit</code>.
      </p>
      <p>
        <a href="/engine-demo.html">Engine demo</a>
      </p>
    </main>
  </StrictMode>,
);
