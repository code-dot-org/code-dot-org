import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ChallengeBox, {
  Challenge,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengeBox';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {fetchJson: jest.fn()},
}));

// React Flow does not render in jsdom; the whiteboard canvas is stubbed out.
jest.mock('@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () =>
      React.createElement('div', {'data-testid': 'react-flow-canvas'}),
  };
});

const fetchJson = HttpClient.fetchJson as jest.Mock;

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
  });

  it('fetches the challenge for the lesson and shows its question', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});

    render(<ChallengeBox lessonId={42} />);

    expect(fetchJson).toHaveBeenCalledWith('/challenges?lesson_id=42');
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
    expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Video'}));

    // jsdom has no navigator.mediaDevices, so the video challenge settles
    // into its camera-unavailable error state.
    expect(screen.queryByTestId('react-flow-canvas')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByText(/Camera recording is not available/)
      ).toBeInTheDocument()
    );
  });
});
