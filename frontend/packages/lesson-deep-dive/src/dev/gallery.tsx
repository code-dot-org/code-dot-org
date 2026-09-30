// No redux Provider, unlike main.tsx: the gallery reads no redux state.

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {z} from 'zod';

import {
  ApiClientProvider,
  createApiClient,
  createKyTransport,
  refreshCsrfToken,
  resolveCsrfToken,
} from '@code-dot-org/core/api';

import ChallengeGallery from '../gallery/ChallengeGallery';
import {type TutorGalleryData} from '../gallery/types';

import {DevPageChrome} from './devPageChrome';
import {registerGalleryMocks} from './galleryMocks';

const TutorGalleryDataSchema = z.object({
  currentUnitId: z.number(),
  is_teacher: z.boolean(),
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

  const apiClient = createApiClient(
    createKyTransport({
      baseUrl: window.location.origin,
      credentials: 'same-origin',
      getCsrfToken: resolveCsrfToken,
      kyOptions: {timeout: false},
    }),
  );
  // gallery.html has no csrf-token meta tag; prime it the way HttpClient did.
  await refreshCsrfToken(apiClient.transport);

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

  createRoot(container).render(
    <StrictMode>
      <ApiClientProvider client={apiClient}>
        <DevPageChrome>
          <ChallengeGallery tutorGalleryData={tutorGalleryData} />
        </DevPageChrome>
      </ApiClientProvider>
    </StrictMode>,
  );
}

void boot();
