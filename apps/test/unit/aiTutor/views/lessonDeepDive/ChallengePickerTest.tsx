import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';

import ChallengePicker from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengePicker';
import {
  Challenge,
  challengeValidator,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {fetchJson: jest.fn()},
}));

const fetchJson = HttpClient.fetchJson as jest.Mock;

const fakeChallenges: Challenge[] = [
  {
    id: 1,
    lesson_id: 42,
    question: 'Draw a flowchart of the algorithm.',
    default_modality: 'whiteboard',
    whiteboard_starter_image_url: null,
    whiteboard_starter_image_alt_text: null,
  },
  {
    id: 2,
    lesson_id: 42,
    question: 'Explain the algorithm out loud.',
    default_modality: 'video',
    whiteboard_starter_image_url: null,
    whiteboard_starter_image_alt_text: null,
  },
  {
    id: 3,
    lesson_id: 42,
    question: 'Sketch another diagram.',
    default_modality: 'whiteboard',
    whiteboard_starter_image_url: null,
    whiteboard_starter_image_alt_text: null,
  },
];

function renderPicker(challengeSetCallback = jest.fn()) {
  render(
    <MemoryRouter>
      <ChallengePicker
        lessonId={42}
        challengeSetCallback={challengeSetCallback}
      />
    </MemoryRouter>
  );
  return challengeSetCallback;
}

describe('ChallengePicker', () => {
  beforeEach(() => {
    fetchJson.mockReset();
  });

  it('fetches the challenges for the lesson on mount', () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    renderPicker();
    expect(fetchJson).toHaveBeenCalledWith(
      '/challenges?lesson_id=42',
      {},
      challengeValidator
    );
  });

  it('renders the heading and modality buttons', () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    renderPicker();
    expect(
      screen.getByRole('heading', {name: 'Choose your challenge'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Create a video/i})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Create on a whiteboard/i})
    ).toBeInTheDocument();
  });

  it('shows no challenge cards before a modality is selected', () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    renderPicker();
    expect(screen.queryByText('Your Challenge')).not.toBeInTheDocument();
  });

  it('shows only whiteboard challenges after selecting the whiteboard modality', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i})
    );

    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument()
    );
    expect(screen.getByText(fakeChallenges[2].question)).toBeInTheDocument();
    // Video challenge must not appear.
    expect(
      screen.queryByText(fakeChallenges[1].question)
    ).not.toBeInTheDocument();
  });

  it('shows only video challenges after selecting the video modality', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    renderPicker();

    fireEvent.click(screen.getByRole('button', {name: /Create a video/i}));

    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[1].question)).toBeInTheDocument()
    );
    expect(
      screen.queryByText(fakeChallenges[0].question)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(fakeChallenges[2].question)
    ).not.toBeInTheDocument();
  });

  it('re-filters when the modality selection changes', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i})
    );
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', {name: /Create a video/i}));
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[1].question)).toBeInTheDocument()
    );
    expect(
      screen.queryByText(fakeChallenges[0].question)
    ).not.toBeInTheDocument();
  });

  it('shows an empty state when no challenges match the selected modality', async () => {
    const videoOnly: Challenge[] = [fakeChallenges[1]];
    fetchJson.mockResolvedValue({value: videoOnly});
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i})
    );

    await waitFor(() =>
      expect(
        screen.getByText(/No challenges available for this mode/)
      ).toBeInTheDocument()
    );
  });

  it('shows an empty state when the fetch fails', async () => {
    fetchJson.mockRejectedValue(new Error('network error'));
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i})
    );

    await waitFor(() =>
      expect(
        screen.getByText(/No challenges available for this mode/)
      ).toBeInTheDocument()
    );
  });

  it('calls the callback with the challenge and selected modality when Start challenge is clicked', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    const callback = renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i})
    );
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument()
    );

    // Two whiteboard challenges → two Start challenge buttons. Click the first.
    const startButtons = screen.getAllByRole('button', {
      name: 'Start challenge',
    });
    fireEvent.click(startButtons[0]);

    expect(callback).toHaveBeenCalledWith(fakeChallenges[0], 'whiteboard');
  });

  it('renders the "I want to review instead" link', () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    renderPicker();
    expect(
      screen.getByRole('button', {name: /I want to review instead/i})
    ).toBeInTheDocument();
  });
});
