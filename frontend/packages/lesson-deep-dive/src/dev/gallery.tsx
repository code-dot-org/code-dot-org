// No redux Provider, unlike main.tsx: the gallery reads no redux state.

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
  // Without the worker, the Vite proxy forwards requests to a local Rails.
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
