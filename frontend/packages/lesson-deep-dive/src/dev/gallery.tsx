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
import {TUTOR_GALLERY_DATA, type TutorGalleryData} from './galleryFixtures';
import {registerGalleryMocks} from './galleryMocks';

const TUTOR_GALLERY_DATA_PATH = '/api/v1/tutor_gallery_data';

// ?script= and ?lessonPosition= pick which lesson dashboard mode bootstraps
// from; msw mode ignores both, since its response is the fixture regardless.
function tutorGalleryDataQuery(): string {
  const query = new URLSearchParams(window.location.search);
  return new URLSearchParams({
    script: query.get('script') ?? 'aif1-2025',
    lessonPosition: query.get('lessonPosition') ?? '1',
  }).toString();
}

async function fetchTutorGalleryData(): Promise<TutorGalleryData> {
  const response = await fetch(
    `${TUTOR_GALLERY_DATA_PATH}?${tutorGalleryDataQuery()}`,
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function boot(): Promise<void> {
  // Without the worker, requests go through the Vite proxy to a local Rails
  // dashboard. VITE_API_MODE=msw serves the fixtures instead.
  if (import.meta.env.VITE_API_MODE === 'msw') {
    const {startMockWorker} = await import('@code-dot-org/core/api/mocks');
    registerGalleryMocks();
    await startMockWorker();
  }

  // The endpoint may 404 (no local script/lesson to resolve), redirect to
  // sign-in (Devise, signed out), or simply not exist yet on this checkout —
  // any of those falls back to the fixture rather than leaving a blank page.
  let tutorGalleryData: TutorGalleryData;
  try {
    tutorGalleryData = await fetchTutorGalleryData();
  } catch (error) {
    console.info(
      `Tutor gallery: fetching ${TUTOR_GALLERY_DATA_PATH} failed (${
        error instanceof Error ? error.message : String(error)
      }); rendering the built-in TUTOR_GALLERY_DATA fixture instead.`,
    );
    tutorGalleryData = TUTOR_GALLERY_DATA;
  }

  createReactRoot(
    <StrictMode>
      <DevPageChrome>
        <ChallengeGallery tutorGalleryData={tutorGalleryData} />
      </DevPageChrome>
    </StrictMode>,
    document.getElementById('tutor-gallery-container')!,
  );
}

void boot();
