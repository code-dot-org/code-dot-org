import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PodcastsBox from '@cdo/apps/aiTutor/views/lessonDeepDive/ReviewModalities/PodcastsBox';
import {ReflectionData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {get: jest.fn()},
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

// Routes the two GETs PodcastsBox makes: the audio blob from
// retrieve_podcast_from_s3 and the transcript JSON from the show route.
function mockEndpoints(script: ScriptLine[] | null = null) {
  mockGet.mockImplementation((url: string) => {
    if (url.includes('retrieve_podcast_from_s3')) {
      return Promise.resolve({
        blob: () =>
          Promise.resolve(new Blob(['mp3-bytes'], {type: 'audio/mpeg'})),
      });
    }
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          podcast_script: script ? JSON.stringify(script) : null,
        }),
    });
  });
}

function retrieveUrl(): string | undefined {
  return mockGet.mock.calls
    .map(call => call[0] as string)
    .find(url => url.includes('retrieve_podcast_from_s3'));
}

describe('PodcastsBox', () => {
  beforeEach(() => {
    mockGet.mockReset();
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();
  });

  it('requests the podcast for the lesson and the struggling objectives only', async () => {
    mockEndpoints();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={reflectionData}
        objectives={[]}
      />
    );

    await waitFor(() => expect(retrieveUrl()).toBeDefined());
    const url = retrieveUrl();
    expect(url).toContain('lesson_id=42');
    expect(url).toContain('objective_ids%5B%5D=10');
    expect(url).toContain('objective_ids%5B%5D=20');
    // The confident objective is not part of the podcast key.
    expect(url).not.toContain('objective_ids%5B%5D=30');
  });

  it('turns the fetched blob into an object URL and enables playback', async () => {
    mockEndpoints();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={reflectionData}
        objectives={[]}
      />
    );

    // The play button is disabled until the audio source is ready, so it
    // becoming enabled is the user-visible signal that the blob was wired up.
    const playButton = await screen.findByRole('button', {name: 'Play'});
    await waitFor(() => expect(playButton).toBeEnabled());
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('renders the script transcript in the description when ready', async () => {
    mockEndpoints([
      {voice_id: 'Dan', text: 'What is a variable?'},
      {voice_id: 'Sam', text: 'A named box for a value.'},
    ]);
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={reflectionData}
        objectives={[]}
      />
    );

    expect(await screen.findByText('What is a variable?')).toBeInTheDocument();
    expect(screen.getByText('A named box for a value.')).toBeInTheDocument();
    expect(screen.getByText('Dan')).toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
  });

  it('shows an unavailable message and disables controls when retrieval fails', async () => {
    mockGet.mockRejectedValue(new Error('404 Not Found'));
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={reflectionData}
        objectives={[]}
      />
    );

    expect(
      await screen.findByText(/podcast isn't ready yet/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Play'})).toBeDisabled();
  });

  it('requests the lesson-level podcast with no objective ids when nothing is struggling', async () => {
    mockEndpoints();
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
      />
    );

    await waitFor(() => expect(retrieveUrl()).toBeDefined());
    const url = retrieveUrl();
    expect(url).toContain('lesson_id=42');
    expect(url).not.toContain('objective_ids');
  });

  it('requests using all lesson objectives when reflectionData is null', async () => {
    mockEndpoints();
    render(
      <PodcastsBox
        lessonId={LESSON_ID}
        reflectionData={null}
        objectives={[
          {id: '10', description: 'First objective'},
          {id: '20', description: 'Second objective'},
        ]}
      />
    );

    await waitFor(() => expect(retrieveUrl()).toBeDefined());
    const url = retrieveUrl();
    expect(url).toContain('lesson_id=42');
    expect(url).toContain('objective_ids%5B%5D=10');
    expect(url).toContain('objective_ids%5B%5D=20');
  });

  it('requests using all lesson objectives when the reflection was submitted with no ratings', async () => {
    mockEndpoints();
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
      />
    );

    await waitFor(() => expect(retrieveUrl()).toBeDefined());
    const url = retrieveUrl();
    expect(url).toContain('lesson_id=42');
    expect(url).toContain('objective_ids%5B%5D=10');
    expect(url).toContain('objective_ids%5B%5D=20');
  });
});
