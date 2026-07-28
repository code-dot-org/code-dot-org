import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PodcastsBox from '../ReviewModalities/PodcastsBox';
import {ReflectionData} from '../types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

vi.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {get: vi.fn()},
}));

const mockGet = HttpClient.get as jest.Mock;

const LESSON_ID = 42;

// Two struggling objectives (10, 20) plus one the student is confident on (30),
// which should be excluded from the retrieval request.
const reflectionData: ReflectionData = {
  objectiveReflections: {
    '10': LessonObjectiveReflectionValues.LOST,
    '20': LessonObjectiveReflectionValues.UNSURE,
    '30': LessonObjectiveReflectionValues.CONFIDENT,
  },
  success: '',
  struggle: '',
};

type ScriptLine = {voice_id: string; text: string};

// Stubs the transcript GET. The audio bytes are loaded by the <audio> element
// itself from a same-origin src URL — HttpClient is no longer in that path.
function mockTranscript(script: ScriptLine[] | null = null) {
  mockGet.mockResolvedValue({
    json: () =>
      Promise.resolve({
        podcast_script: script ? JSON.stringify(script) : null,
      }),
  });
}

function audioElement(): HTMLAudioElement {
  const el = document.querySelector('audio');
  if (!el) throw new Error('No audio element rendered');
  return el as HTMLAudioElement;
}

// Returns the literal value set on the src attribute, not the absolute URL
// the browser would resolve from it.
function audioSrc(): string {
  const src = audioElement().getAttribute('src');
  if (src === null) throw new Error('Audio element has no src attribute');
  return src;
}

describe('PodcastsBox', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('points the audio element at the controller URL with lesson + struggling objectives only', () => {
    mockTranscript();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={reflectionData}
        objectives={[]}
      />,
    );

    const src = audioSrc();
    expect(src).toContain('/ai_student_podcasts/retrieve_podcast_from_s3');
    expect(src).toContain('lesson_id=42');
    expect(src).toContain('objective_ids%5B%5D=10');
    expect(src).toContain('objective_ids%5B%5D=20');
    // The confident objective is not part of the podcast key.
    expect(src).not.toContain('objective_ids%5B%5D=30');
  });

  it('enables playback once the audio element fires canplay', async () => {
    mockTranscript();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={reflectionData}
        objectives={[]}
      />,
    );

    const playButton = screen.getByRole('button', {name: 'Play'});
    expect(playButton).toBeDisabled();

    fireEvent.canPlay(audioElement());
    await waitFor(() => expect(playButton).toBeEnabled());
  });

  it('renders the script transcript once both the audio is ready and the transcript arrives', async () => {
    mockTranscript([
      {voice_id: 'Dan', text: 'What is a variable?'},
      {voice_id: 'Sam', text: 'A named box for a value.'},
    ]);
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={reflectionData}
        objectives={[]}
      />,
    );

    fireEvent.canPlay(audioElement());

    expect(await screen.findByText('What is a variable?')).toBeInTheDocument();
    expect(screen.getByText('A named box for a value.')).toBeInTheDocument();
    expect(screen.getByText('Dan')).toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
  });

  it('shows an unavailable message and disables controls when the audio fails to load', async () => {
    mockTranscript();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={reflectionData}
        objectives={[]}
      />,
    );

    fireEvent.error(audioElement());

    expect(
      await screen.findByText(/podcast isn't ready yet/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Play'})).toBeDisabled();
  });

  it('uses no objective ids in the audio URL when nothing is struggling', () => {
    mockTranscript();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={{
          objectiveReflections: {
            '30': LessonObjectiveReflectionValues.CONFIDENT,
          },
          success: '',
          struggle: '',
        }}
        objectives={[]}
      />,
    );

    const src = audioSrc();
    expect(src).toContain('lesson_id=42');
    expect(src).not.toContain('objective_ids');
  });

  it('uses all lesson objectives in the audio URL when reflectionData is null', () => {
    mockTranscript();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={null}
        objectives={[
          {id: '10', description: 'First objective'},
          {id: '20', description: 'Second objective'},
        ]}
      />,
    );

    const src = audioSrc();
    expect(src).toContain('lesson_id=42');
    expect(src).toContain('objective_ids%5B%5D=10');
    expect(src).toContain('objective_ids%5B%5D=20');
  });

  it('uses all lesson objectives in the audio URL when the reflection was submitted with no ratings', () => {
    mockTranscript();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={{
          objectiveReflections: {},
          success: '',
          struggle: '',
        }}
        objectives={[
          {id: '10', description: 'First objective'},
          {id: '20', description: 'Second objective'},
        ]}
      />,
    );

    const src = audioSrc();
    expect(src).toContain('lesson_id=42');
    expect(src).toContain('objective_ids%5B%5D=10');
    expect(src).toContain('objective_ids%5B%5D=20');
  });
});
