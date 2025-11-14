import {createElement} from 'react';
import {createRoot} from 'react-dom/client';

import App from '../src/App';

// This root element is added to the page in dashboard/views/app/index.html.haml via rails_vite
const mount = document.getElementById('vite-root');

if (mount) {
  createRoot(mount).render(createElement(App));
}
