import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Scaffold entry: mounts a placeholder. The account-settings shell replaces this
// with the real MSW-backed dev host (fonts, theme, scenario switcher, the page).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <p>@code-dot-org/users — scaffold</p>
  </StrictMode>,
);
