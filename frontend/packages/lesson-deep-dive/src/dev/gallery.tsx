// Standalone dev shell entry for the Tutor+ project gallery, the teacher-
// facing view alongside the student lesson deep dive in main.tsx. Mounts
// the same page component the webpack entry mounts
// (apps/src/sites/studio/pages/lessons/tutor_gallery.js), with no Rails and
// no webpack; see README.md.
//
// Unlike tutor.js, that entry mounts with no redux Provider — the gallery
// reads no redux state — so neither does this.

import './nodeShims';

import {StrictMode} from 'react';

import {
  ApiClientProvider,
  createApiClient,
  createKyTransport,
} from '@code-dot-org/core/api';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import TutorGalleryPage from '../gallery/TutorGalleryPage';

import {DevPageChrome} from './devPageChrome';
import {registerGalleryMocks} from './galleryMocks';

async function boot(): Promise<void> {
  // Without the worker, requests go through the Vite proxy to a local Rails
  // dashboard. VITE_API_MODE=msw serves the fixtures instead.
  if (import.meta.env.VITE_API_MODE === 'msw') {
    const {startMockWorker} = await import('@code-dot-org/core/api/mocks');
    registerGalleryMocks();
    await startMockWorker();
  }

  // Same-origin, root-relative requests, same as the Studio entry
  // (apps/src/sites/studio/pages/lessons/tutor_gallery.js): the gallery's
  // own fetches ride the Vite proxy set up in vite.config.ts.
  const apiClient = createApiClient(
    createKyTransport({
      baseUrl: window.location.origin,
      credentials: 'same-origin',
      kyOptions: {timeout: false},
    }),
  );

  // ?script= and ?lessonPosition= pick which lesson dashboard mode
  // bootstraps from; msw mode ignores both, since its response is the
  // fixture regardless.
  const query = new URLSearchParams(window.location.search);
  const lessonPath = `/s/${query.get('script') ?? 'aif1-2025'}/lessons/${
    query.get('lessonPosition') ?? '1'
  }`;

  createReactRoot(
    <StrictMode>
      <ApiClientProvider client={apiClient}>
        <DevPageChrome>
          <TutorGalleryPage lessonPath={lessonPath} />
        </DevPageChrome>
      </ApiClientProvider>
    </StrictMode>,
    document.getElementById('tutor-gallery-container')!,
  );
}

void boot();
