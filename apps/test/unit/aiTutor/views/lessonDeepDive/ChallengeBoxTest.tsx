import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ChallengeBox from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengeBox';
import {
  Challenge,
  challengeValidator,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
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

  it('shows a confirmation dialog once the response is submitted', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});
    snapshot.mockResolvedValue({
      blob: new Blob(['png-bytes'], {type: 'image/png'}),
    });
    post.mockResolvedValue({
      json: async () => ({
        id: 7,
        assets: [{id: 9, asset_type: 'whiteboard_image'}],
      }),
    });
    put.mockResolvedValue({});

    render(<ChallengeBox lessonId={42} />);

    await waitFor(() =>
      expect(
        screen.getByText('Draw a flowchart of the algorithm.')
      ).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() =>
      expect(screen.getByText('Response submitted')).toBeInTheDocument()
    );

    // Dismissing the dialog leaves the challenge in its submitted state.
    fireEvent.click(screen.getByRole('button', {name: 'OK'}));
    expect(screen.queryByText('Response submitted')).not.toBeInTheDocument();
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
