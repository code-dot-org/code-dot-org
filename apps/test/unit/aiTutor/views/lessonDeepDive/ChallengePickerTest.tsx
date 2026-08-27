import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ChallengePicker from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengePicker';
import {
  Challenge,
  challengeValidator,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

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
    whiteboard_starter_image_alt_text: null,
  },
  {
    id: 2,
    lesson_id: 42,
    question: 'Explain the algorithm out loud.',
    default_modality: 'video',
    whiteboard_starter_image_alt_text: null,
  },
];

const renderPicker = (challengeSetCallback = jest.fn()) => {
  render(
    <ChallengePicker
      lessonId={42}
      challengeSetCallback={challengeSetCallback}
    />
  );
  return challengeSetCallback;
};

const waitForQuestion = async (question: string) =>
  waitFor(() => expect(screen.getByText(question)).toBeInTheDocument());

describe('ChallengePicker', () => {
  beforeEach(() => {
    fetchJson.mockReset();
  });

  it('fetches the challenges for the lesson', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});

    renderPicker();

    expect(fetchJson).toHaveBeenCalledWith(
      '/challenges?lesson_id=42',
      {},
      challengeValidator
    );
    await waitForQuestion(fakeChallenges[0].question);
  });

  it('shows the fetched challenges in the carousel', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});

    renderPicker();

    await waitForQuestion(fakeChallenges[0].question);
  });

  it('changes the shown challenge when the left and right arrows are clicked', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});

    renderPicker();
    await waitForQuestion(fakeChallenges[0].question);

    fireEvent.click(
      screen.getByRole('button', {name: 'scroll challenge right'})
    );
    await waitForQuestion(fakeChallenges[1].question);
    expect(
      screen.queryByText(fakeChallenges[0].question)
    ).not.toBeInTheDocument();

    // Only two challenges exist, so scrolling right again wraps back around.
    fireEvent.click(
      screen.getByRole('button', {name: 'scroll challenge right'})
    );
    await waitForQuestion(fakeChallenges[0].question);

    // Scrolling left from the first challenge wraps to the last one.
    fireEvent.click(
      screen.getByRole('button', {name: 'scroll challenge left'})
    );
    await waitForQuestion(fakeChallenges[1].question);
  });

  it('selects and recommends the challenge type button matching the shown challenge', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});

    renderPicker();
    await waitForQuestion(fakeChallenges[0].question);

    // fakeChallenges[0]'s default modality is whiteboard.
    const whiteboardButton = screen.getByRole('button', {
      name: /^Whiteboard/,
    });
    const videoButton = screen.getByRole('button', {name: /^Video/});

    expect(
      within(whiteboardButton).getByText('(recommended)')
    ).toBeInTheDocument();
    expect(
      within(videoButton).queryByText('(recommended)')
    ).not.toBeInTheDocument();
    // eslint-disable-next-line no-restricted-properties
    expect(whiteboardButton).toHaveClass('Selected');
    // eslint-disable-next-line no-restricted-properties
    expect(videoButton).not.toHaveClass('Selected');
  });

  it('changes the challenge type when the whiteboard or video buttons are clicked', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});

    renderPicker();
    await waitForQuestion(fakeChallenges[0].question);

    const whiteboardButton = screen.getByRole('button', {
      name: /^Whiteboard/,
    });
    const videoButton = screen.getByRole('button', {name: /^Video/});

    fireEvent.click(videoButton);

    // eslint-disable-next-line no-restricted-properties
    expect(videoButton).toHaveClass('Selected');
    // eslint-disable-next-line no-restricted-properties
    expect(whiteboardButton).not.toHaveClass('Selected');
    // The recommended label tracks the challenge's default modality, not
    // which type is currently selected.
    expect(
      within(whiteboardButton).getByText('(recommended)')
    ).toBeInTheDocument();

    fireEvent.click(whiteboardButton);

    // eslint-disable-next-line no-restricted-properties
    expect(whiteboardButton).toHaveClass('Selected');
    // eslint-disable-next-line no-restricted-properties
    expect(videoButton).not.toHaveClass('Selected');
  });

  it('calls the callback with the shown challenge and selected type when the begin button is clicked', async () => {
    fetchJson.mockResolvedValue({value: fakeChallenges});
    const challengeSetCallback = renderPicker();

    await waitForQuestion(fakeChallenges[0].question);

    fireEvent.click(screen.getByRole('button', {name: /^Video/}));
    fireEvent.click(screen.getByRole('button', {name: 'Start the Challenge!'}));

    expect(challengeSetCallback).toHaveBeenCalledWith(
      fakeChallenges[0],
      ChallengeTypes.VIDEO
    );
  });
});
