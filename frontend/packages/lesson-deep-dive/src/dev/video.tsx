// A page with one tutor video and a Previous/Next switch, for the Playwright
// suite in e2e/ and for poking at <json-video> without the deep dive around
// it. The switch does what VideosBox's carousel does: the same <json-video>
// gets a new src and reloads, which is where a previous video's audio can
// leak into the next one.
//
// It renders TutorVideo and the element itself rather than VideosBox because
// the carousel also pulls classnames and the component library out of
// apps/node_modules, which CI does not install. The two files this page
// reads from apps/ depend on nothing but React.

import './nodeShims';
import '@cdo/apps/jsonVideo/jsonVideoElement';

import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';

import TutorVideo from '@cdo/apps/jsonVideo/TutorVideo';

import {DevPageChrome} from './devPageChrome';
import {LESSON_DEEP_DIVE_DATA} from './fixtures';
import {registerLessonDeepDiveMocks} from './mocks';

const videos = LESSON_DEEP_DIVE_DATA.jsonVideos;

function VideoSwitcher() {
  const [index, setIndex] = useState(0);
  const goTo = (next: number) =>
    setIndex((next + videos.length) % videos.length);
  const current = videos[index];

  return (
    <div style={{maxWidth: 640, margin: '0 auto', color: '#fff'}}>
      <TutorVideo href={current.url} />
      <p>{current.description}</p>
      <button type="button" onClick={() => goTo(index - 1)}>
        Previous video
      </button>{' '}
      <button type="button" onClick={() => goTo(index + 1)}>
        Next video
      </button>
    </div>
  );
}

async function boot(): Promise<void> {
  if (import.meta.env.VITE_API_MODE === 'msw') {
    const {startMockWorker} = await import('@code-dot-org/core/api/mocks');
    registerLessonDeepDiveMocks();
    await startMockWorker();
  }

  createRoot(document.getElementById('tutor-video-container')!).render(
    <StrictMode>
      <DevPageChrome>
        <VideoSwitcher />
      </DevPageChrome>
    </StrictMode>,
  );
}

void boot();
