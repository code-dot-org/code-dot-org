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

function mockOkResponse() {
  mockGet.mockResolvedValue({
    blob: () => Promise.resolve(new Blob(['mp3-bytes'], {type: 'audio/mpeg'})),
  });
}

describe('PodcastsBox', () => {
  beforeEach(() => {
    mockGet.mockReset();
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();
  });

  it('requests the podcast for the lesson and the struggling objectives only', async () => {
    mockOkResponse();
    render(
      <PodcastsBox lessonId={LESSON_ID} reflectionData={reflectionData} />
    );

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('/ai_student_podcasts/retrieve_podcast_from_s3?');
    expect(url).toContain('lesson_id=42');
    expect(url).toContain('objective_ids%5B%5D=10');
    expect(url).toContain('objective_ids%5B%5D=20');
    // The confident objective is not part of the podcast key.
    expect(url).not.toContain('objective_ids%5B%5D=30');
  });

  it('turns the fetched blob into an object URL and enables playback', async () => {
    mockOkResponse();
    render(
      <PodcastsBox lessonId={LESSON_ID} reflectionData={reflectionData} />
    );

    // The play button is disabled until the audio source is ready, so it
    // becoming enabled is the user-visible signal that the blob was wired up.
    const playButton = await screen.findByRole('button', {name: 'Play'});
    await waitFor(() => expect(playButton).toBeEnabled());
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('shows an unavailable message and disables controls when retrieval fails', async () => {
    mockGet.mockRejectedValue(new Error('404 Not Found'));
    render(
      <PodcastsBox lessonId={LESSON_ID} reflectionData={reflectionData} />
    );

    expect(
      await screen.findByText(/podcast isn't ready yet/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Play'})).toBeDisabled();
  });

  it('does not request a podcast when there are no struggling objectives', async () => {
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
      />
    );

    expect(
      await screen.findByText(/podcast isn't ready yet/i)
    ).toBeInTheDocument();
    expect(mockGet).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Play'})).toBeDisabled();
  });

  it('does not request a podcast when reflectionData is null', async () => {
    render(<PodcastsBox lessonId={LESSON_ID} reflectionData={null} />);

    expect(
      await screen.findByText(/podcast isn't ready yet/i)
    ).toBeInTheDocument();
    expect(mockGet).not.toHaveBeenCalled();
  });
});
