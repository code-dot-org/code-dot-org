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
import {z} from 'zod';

import ChallengeGallery from '@cdo/apps/aiTutor/views/gallery/ChallengeGallery';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import {DevPageChrome} from './devPageChrome';
import {type TutorGalleryData} from './galleryFixtures';
import {registerGalleryMocks} from './galleryMocks';

const TutorGalleryDataSchema = z.object({
  currentUnitId: z.number(),
  units: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      position: z.number(),
      link: z.string(),
    }),
  ),
  sections: z.array(z.object({id: z.number(), name: z.string()})),
});

// ?script= and ?lessonPosition= pick the lesson; msw mode ignores both.
function tutorGalleryDataPath(): string {
  const query = new URLSearchParams(window.location.search);
  const script = query.get('script') ?? 'aif1-2025';
  const lessonPosition = query.get('lessonPosition') ?? '1';
  return `/api/v1/scripts/${script}/lessons/${lessonPosition}/tutor_gallery_data`;
}

async function fetchTutorGalleryData(): Promise<TutorGalleryData> {
  const response = await fetch(tutorGalleryDataPath());
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return TutorGalleryDataSchema.parse(await response.json());
}

async function boot(): Promise<void> {
  // Without the worker, requests go through the Vite proxy to a local Rails
  // dashboard. VITE_API_MODE=msw serves the fixtures instead.
  if (import.meta.env.VITE_API_MODE === 'msw') {
    const {startMockWorker} = await import('@code-dot-org/core/api/mocks');
    registerGalleryMocks();
    await startMockWorker();
  }

  const container = document.getElementById('tutor-gallery-container')!;
  let tutorGalleryData: TutorGalleryData;
  try {
    tutorGalleryData = await fetchTutorGalleryData();
  } catch (error) {
    container.textContent = `Tutor gallery bootstrap failed: ${
      error instanceof Error ? error.message : String(error)
    }`;
    return;
  }

  createReactRoot(
    <StrictMode>
      <DevPageChrome>
        <ChallengeGallery tutorGalleryData={tutorGalleryData} />
      </DevPageChrome>
    </StrictMode>,
    container,
  );
}

void boot();
