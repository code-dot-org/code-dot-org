import {
  Challenge,
  ChallengeResponse,
  challengeValidator,
} from '@code-dot-org/lesson-deep-dive';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ChallengeBox from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengeBox';
import {ReactFlowSketchLabSources} from '@cdo/apps/sketchlab/reactFlow/types';
import {createSketchSnapshotBlob} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {fetchJson: jest.fn(), post: jest.fn(), put: jest.fn()},
}));

jest.mock(
  '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob',
  () => ({
    createSketchSnapshotBlob: jest.fn(),
  })
);

// React Flow does not render in jsdom; the whiteboard canvas is stubbed out.
// The stub's button reports one node through updateSources, simulating the
// student drawing (which enables the submit button).
jest.mock('@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: {
      updateSources: (sources: ReactFlowSketchLabSources) => void;
    }) =>
      React.createElement(
        'div',
        null,
        'Whiteboard canvas stub',
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () =>
              props.updateSources({
                source: {nodes: [{id: 'n1'}], edges: []},
              } as unknown as ReactFlowSketchLabSources),
          },
          'Draw something'
        )
      ),
  };
});

const fetchJson = HttpClient.fetchJson as jest.Mock;
const post = HttpClient.post as jest.Mock;
const put = HttpClient.put as jest.Mock;
const snapshot = createSketchSnapshotBlob as jest.Mock;

const fakeChallenge: Challenge = {
  id: 1,
  lesson_id: 42,
  question: 'Draw a flowchart of the algorithm.',
  default_modality: 'whiteboard',
  whiteboard_starter_image_alt_text: null,
};

const createdResponse = {
  id: 7,
  assets: [{id: 9, asset_type: 'whiteboard_image'}],
};

// Shape of the ChallengeResponse the polling effect fetches from
// `/challenge_responses/<id>`. Only evaluation_status and student_feedback
// vary across polls; the rest is filler the component doesn't read.
const fakeChallengeResponse = (
  overrides: Partial<ChallengeResponse> = {}
): ChallengeResponse => ({
  id: 7,
  challenge_id: 1,
  user_id: 1,
  user_name: 'Student',
  unit_id: null,
  lesson_position: null,
  student_text: null,
  transcript: null,
  student_feedback: null,
  evaluation_status: 'running',
  is_final: true,
  created_at: '2024-01-01T12:00:00Z',
  assets: [{id: 9, asset_type: 'whiteboard_image', download_url: null}],
  ...overrides,
});

// Draws on the whiteboard and submits, past the point where ChallengeBox
// has created the response and kicked off evaluation (setEvaluationStatus
// only resolves to PENDING when the /evaluate POST reports response.ok).
const submitWhiteboardChallenge = async () => {
  await waitFor(() =>
    expect(
      screen.getByText('Draw a flowchart of the algorithm.')
    ).toBeInTheDocument()
  );
  fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
};

// Advances fake timers by `ms` and flushes the resulting state updates,
// e.g. the promise chain inside the polling effect's setInterval callback.
const tick = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

describe('ChallengeBox', () => {
  beforeEach(() => {
    fetchJson.mockReset();
    post.mockReset();
    put.mockReset();
    snapshot.mockReset();
  });

  it('fetches the challenge for the lesson and shows its question', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});

    render(<ChallengeBox lessonId={42} />);

    expect(fetchJson).toHaveBeenCalledWith(
      '/challenges?lesson_id=42',
      {},
      challengeValidator
    );
    await waitFor(() =>
      expect(
        screen.getByText('Draw a flowchart of the algorithm.')
      ).toBeInTheDocument()
    );
  });

  it('shows a fallback message when no challenge exists', async () => {
    fetchJson.mockResolvedValue({value: []});

    render(<ChallengeBox lessonId={42} />);

    await waitFor(() =>
      expect(
        screen.getByText("We couldn't load a challenge for this lesson.")
      ).toBeInTheDocument()
    );
  });

  it('shows a fallback message when the fetch fails', async () => {
    fetchJson.mockRejectedValue(new Error('network'));

    render(<ChallengeBox lessonId={42} />);

    await waitFor(() =>
      expect(
        screen.getByText("We couldn't load a challenge for this lesson.")
      ).toBeInTheDocument()
    );
  });

  it('toggles between whiteboard and video challenges', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});

    render(<ChallengeBox lessonId={42} />);

    // Whiteboard is the default modality.
    expect(screen.getByText('Whiteboard canvas stub')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Video'}));

    // jsdom has no navigator.mediaDevices, so the video challenge settles
    // into its camera-unavailable error state.
    expect(
      screen.queryByText('Whiteboard canvas stub')
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByText(/Camera recording is not available/)
      ).toBeInTheDocument()
    );
  });

  it('shows the waiting-for-feedback text and image once the response is submitted', async () => {
    fetchJson.mockImplementation((url: string) =>
      url.startsWith('/challenges')
        ? Promise.resolve({value: [fakeChallenge]})
        : Promise.resolve({value: fakeChallengeResponse()})
    );
    snapshot.mockResolvedValue({
      blob: new Blob(['png-bytes'], {type: 'image/png'}),
    });
    post.mockResolvedValue({ok: true, json: async () => createdResponse});
    put.mockResolvedValue({});

    render(<ChallengeBox lessonId={42} />);
    await submitWhiteboardChallenge();

    await waitFor(() =>
      expect(
        screen.getByText('Tutor is writing feedback...')
      ).toBeInTheDocument()
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('displays the feedback once evaluation succeeds', async () => {
    jest.useFakeTimers();
    fetchJson.mockImplementation((url: string) =>
      url.startsWith('/challenges')
        ? Promise.resolve({value: [fakeChallenge]})
        : Promise.resolve({
            value: fakeChallengeResponse({
              evaluation_status: 'success',
              student_feedback: 'Great job explaining the flowchart!',
            }),
          })
    );
    snapshot.mockResolvedValue({
      blob: new Blob(['png-bytes'], {type: 'image/png'}),
    });
    post.mockResolvedValue({ok: true, json: async () => createdResponse});
    put.mockResolvedValue({});

    render(<ChallengeBox lessonId={42} />);
    await submitWhiteboardChallenge();

    await waitFor(() =>
      expect(
        screen.getByText('Tutor is writing feedback...')
      ).toBeInTheDocument()
    );

    // The poll interval fires every 2s.
    await tick(2000);

    await waitFor(() =>
      expect(
        screen.getByText('Great job explaining the flowchart!')
      ).toBeInTheDocument()
    );
    // The waiting screen gives way to the feedback panel.
    expect(
      screen.queryByText('Tutor is writing feedback...')
    ).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it('keeps polling while evaluation is queued or running, then stops once resolved', async () => {
    jest.useFakeTimers();
    const pollResponses = [
      fakeChallengeResponse({evaluation_status: 'queued'}),
      fakeChallengeResponse({evaluation_status: 'running'}),
      fakeChallengeResponse({
        evaluation_status: 'success',
        student_feedback: 'Great job explaining the flowchart!',
      }),
    ];
    fetchJson.mockImplementation((url: string) => {
      if (url.startsWith('/challenges')) {
        return Promise.resolve({value: [fakeChallenge]});
      }
      expect(url).toBe('/challenge_responses/7');
      const next =
        pollResponses.length > 1 ? pollResponses.shift()! : pollResponses[0];
      return Promise.resolve({value: next});
    });
    snapshot.mockResolvedValue({
      blob: new Blob(['png-bytes'], {type: 'image/png'}),
    });
    post.mockResolvedValue({ok: true, json: async () => createdResponse});
    put.mockResolvedValue({});

    render(<ChallengeBox lessonId={42} />);
    await submitWhiteboardChallenge();

    await waitFor(() =>
      expect(
        screen.getByText('Tutor is writing feedback...')
      ).toBeInTheDocument()
    );
    const pollCallsSoFar = () =>
      fetchJson.mock.calls.filter(([url]) => url === '/challenge_responses/7')
        .length;
    // Only the initial challenge fetch has happened so far; polling hasn't
    // ticked yet.
    expect(pollCallsSoFar()).toBe(0);

    // First tick: status is 'queued', so the widget keeps waiting.
    await tick(2000);
    expect(pollCallsSoFar()).toBe(1);
    expect(
      screen.getByText('Tutor is writing feedback...')
    ).toBeInTheDocument();

    // Second tick: status is 'running', still waiting.
    await tick(2000);
    expect(pollCallsSoFar()).toBe(2);
    expect(
      screen.getByText('Tutor is writing feedback...')
    ).toBeInTheDocument();

    // Third tick: status is 'success', feedback replaces the waiting screen.
    await tick(2000);
    await waitFor(() =>
      expect(
        screen.getByText('Great job explaining the flowchart!')
      ).toBeInTheDocument()
    );
    const callsAtSuccess = pollCallsSoFar();

    // Polling stops once the evaluation resolves, so further time passing
    // doesn't add more requests.
    await tick(4000);
    expect(pollCallsSoFar()).toBe(callsAtSuccess);

    jest.useRealTimers();
  });

  it('shows the audio and text buttons in whiteboard mode', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});

    render(<ChallengeBox lessonId={42} />);

    await waitFor(() =>
      expect(
        screen.getByText('Draw a flowchart of the algorithm.')
      ).toBeInTheDocument()
    );

    expect(screen.getByRole('button', {name: 'Audio'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Text'})).toBeInTheDocument();
  });

  it('shows a textarea that can be typed in when the Text button is clicked', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});

    render(<ChallengeBox lessonId={42} />);

    await waitFor(() =>
      expect(
        screen.getByText('Draw a flowchart of the algorithm.')
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', {name: 'Text'}));

    const textarea = document.getElementById(
      'challenge-explanation'
    ) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, {target: {value: 'My explanation'}});
    expect(textarea).toHaveValue('My explanation');
  });

  it('shows a Start Recording button when the Audio button is selected', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});

    render(<ChallengeBox lessonId={42} />);

    await waitFor(() =>
      expect(
        screen.getByText('Draw a flowchart of the algorithm.')
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', {name: 'Audio'}));

    expect(
      screen.getByRole('button', {name: 'Start Recording'})
    ).toBeInTheDocument();
  });
});
