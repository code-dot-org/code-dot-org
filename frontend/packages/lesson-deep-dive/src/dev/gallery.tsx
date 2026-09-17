// Standalone dev shell entry for the Tutor+ project gallery, the teacher-
// facing view alongside the student lesson deep dive in main.tsx. Renders
// the real gallery out of apps/src with no Rails and no webpack; see
// README.md.
//
// Mirrors apps/src/sites/studio/pages/lessons/tutor_gallery.js, the webpack
// entry the Rails page loads. Unlike tutor.js, that entry mounts with no
// redux Provider — the gallery reads no redux state — so neither does this.

import './nodeShims';

import {StrictMode} from 'react';

import ChallengeGallery from '@cdo/apps/aiTutor/views/gallery/ChallengeGallery';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import {DevPageChrome} from './devPageChrome';
import {TUTOR_GALLERY_DATA} from './galleryFixtures';
import {registerGalleryMocks} from './galleryMocks';

async function boot(): Promise<void> {
  // Without the worker, requests go through the Vite proxy to a local Rails
  // dashboard. VITE_API_MODE=msw serves the fixtures instead.
  if (import.meta.env.VITE_API_MODE === 'msw') {
    const {startMockWorker} = await import('@code-dot-org/core/api/mocks');
    registerGalleryMocks();
    await startMockWorker();
  }

  createReactRoot(
    <StrictMode>
      <DevPageChrome>
        <ChallengeGallery tutorGalleryData={TUTOR_GALLERY_DATA} />
      </DevPageChrome>
    </StrictMode>,
    document.getElementById('tutor-gallery-container')!,
  );
}

void boot();
