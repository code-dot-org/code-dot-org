// Dev page: one TutorVideo and a Previous/Next switch over two videos, for the
// Playwright suite in e2e/ and for poking at the element by hand. The switch
// does what the deep dive's carousel does: the same <json-video> gets a new
// src and reloads, which is where a previous video's audio can leak into the
// next one. The videos are built here as data URIs, so the page needs no
// server beyond Vite.

import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';

import {TutorVideo} from '../index';

import {DEV_VIDEOS} from './videos';

function VideoSwitcher() {
  const [index, setIndex] = useState(0);
  const goTo = (next: number) =>
    setIndex((next + DEV_VIDEOS.length) % DEV_VIDEOS.length);
  const current = DEV_VIDEOS[index];

  return (
    <div style={{maxWidth: 640, margin: '2rem auto', fontFamily: 'sans-serif'}}>
      <TutorVideo href={current.href} />
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoSwitcher />
  </StrictMode>,
);
