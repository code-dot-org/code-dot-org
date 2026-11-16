import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {type Mock, vi} from 'vitest';

import {listChallenges} from '../../api';
import {type Challenge} from '../../types';
import ChallengePicker from '../ChallengePicker';

const client = vi.hoisted(() => ({transport: {}}));

vi.mock('@code-dot-org/core/api', () => ({useApiClient: () => client}));

vi.mock('../../api', () => ({listChallenges: vi.fn()}));

const mockList = listChallenges as Mock;

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

function renderPicker(challengeSetCallback = vi.fn()) {
  render(
    <MemoryRouter>
      <ChallengePicker
        lessonId={42}
        challengeSetCallback={challengeSetCallback}
      />
    </MemoryRouter>,
  );
  return challengeSetCallback;
}

describe('ChallengePicker', () => {
  beforeEach(() => {
    mockList.mockReset();
  });

  it('fetches the challenges for the lesson on mount', () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();
    expect(mockList).toHaveBeenCalledWith(client.transport, 42);
  });

  it('renders the heading and modality buttons', () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();
    expect(
      screen.getByRole('heading', {name: 'Choose your challenge'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Create a video/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    ).toBeInTheDocument();
  });

  it('shows no challenge card before a modality is selected', () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();
    expect(screen.queryByText('Your Challenge')).not.toBeInTheDocument();
  });

  it('shows the first matching challenge after selecting a modality', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );

    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument(),
    );
    // Only the first whiteboard challenge visible; the second is not yet shown.
    expect(
      screen.queryByText(fakeChallenges[2].question),
    ).not.toBeInTheDocument();
    // Video challenge never appears.
    expect(
      screen.queryByText(fakeChallenges[1].question),
    ).not.toBeInTheDocument();
  });

  it('shows only the matching video challenge after selecting the video modality', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();

    fireEvent.click(screen.getByRole('button', {name: /Create a video/i}));

    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[1].question)).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(fakeChallenges[0].question),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(fakeChallenges[2].question),
    ).not.toBeInTheDocument();
  });

  it('shows prev/next buttons when multiple challenges match the selected modality', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );

    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', {name: 'Previous challenge'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Next challenge'}),
    ).toBeInTheDocument();
  });

  it('hides prev/next buttons when only one challenge matches the selected modality', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();

    fireEvent.click(screen.getByRole('button', {name: /Create a video/i}));

    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[1].question)).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', {name: 'Previous challenge'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Next challenge'}),
    ).not.toBeInTheDocument();
  });

  it('advances to the next challenge when Next is clicked', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', {name: 'Next challenge'}));

    expect(screen.getByText(fakeChallenges[2].question)).toBeInTheDocument();
    expect(
      screen.queryByText(fakeChallenges[0].question),
    ).not.toBeInTheDocument();
  });

  it('wraps from the last challenge back to the first on Next', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', {name: 'Next challenge'}));
    fireEvent.click(screen.getByRole('button', {name: 'Next challenge'}));

    expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument();
  });

  it('goes back to the previous challenge when Prev is clicked', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', {name: 'Next challenge'}));
    fireEvent.click(screen.getByRole('button', {name: 'Previous challenge'}));

    expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument();
  });

  it('resets to the first challenge when switching modalities', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Next challenge'}));
    expect(screen.getByText(fakeChallenges[2].question)).toBeInTheDocument();

    // Switch to video and back — index should reset.
    fireEvent.click(screen.getByRole('button', {name: /Create a video/i}));
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[1].question)).toBeInTheDocument(),
    );
    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );
    expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument();
  });

  it("shows a 'both' challenge under the whiteboard section", async () => {
    const bothChallenge: Challenge = {
      id: 4,
      lesson_id: 42,
      question: 'Do something on either.',
      default_modality: 'both',
      whiteboard_starter_image_url: null,
      whiteboard_starter_image_alt_text: null,
    };
    mockList.mockResolvedValue([bothChallenge]);
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );

    await waitFor(() =>
      expect(screen.getByText(bothChallenge.question)).toBeInTheDocument(),
    );
  });

  it("shows a 'both' challenge under the video section", async () => {
    const bothChallenge: Challenge = {
      id: 4,
      lesson_id: 42,
      question: 'Do something on either.',
      default_modality: 'both',
      whiteboard_starter_image_url: null,
      whiteboard_starter_image_alt_text: null,
    };
    mockList.mockResolvedValue([bothChallenge]);
    renderPicker();

    fireEvent.click(screen.getByRole('button', {name: /Create a video/i}));

    await waitFor(() =>
      expect(screen.getByText(bothChallenge.question)).toBeInTheDocument(),
    );
  });

  it('excludes whiteboard-only challenges from the video section', async () => {
    mockList.mockResolvedValue([fakeChallenges[0]]);
    renderPicker();

    fireEvent.click(screen.getByRole('button', {name: /Create a video/i}));

    await waitFor(() =>
      expect(
        screen.getByText(/No challenges available for this mode/),
      ).toBeInTheDocument(),
    );
  });

  it('shows an empty state when no challenges match the selected modality', async () => {
    mockList.mockResolvedValue([fakeChallenges[1]]);
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );

    await waitFor(() =>
      expect(
        screen.getByText(/No challenges available for this mode/),
      ).toBeInTheDocument(),
    );
  });

  it('shows an empty state when the fetch fails', async () => {
    mockList.mockRejectedValue(new Error('network error'));
    renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );

    await waitFor(() =>
      expect(
        screen.getByText(/No challenges available for this mode/),
      ).toBeInTheDocument(),
    );
  });

  it('calls the callback with the current challenge and modality when Start challenge is clicked', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    const callback = renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', {name: 'Start challenge'}));

    expect(callback).toHaveBeenCalledWith(fakeChallenges[0], 'whiteboard');
  });

  it('calls the callback with the navigated-to challenge when Start challenge is clicked after advancing', async () => {
    mockList.mockResolvedValue(fakeChallenges);
    const callback = renderPicker();

    fireEvent.click(
      screen.getByRole('button', {name: /Create on a whiteboard/i}),
    );
    await waitFor(() =>
      expect(screen.getByText(fakeChallenges[0].question)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Next challenge'}));
    fireEvent.click(screen.getByRole('button', {name: 'Start challenge'}));

    expect(callback).toHaveBeenCalledWith(fakeChallenges[2], 'whiteboard');
  });

  it('renders the "I want to review instead" link', () => {
    mockList.mockResolvedValue(fakeChallenges);
    renderPicker();
    expect(
      screen.getByRole('button', {name: /I want to review instead/i}),
    ).toBeInTheDocument();
  });
});
