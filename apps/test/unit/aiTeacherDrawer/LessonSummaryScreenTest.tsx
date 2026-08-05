import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import LessonSummaryScreen from '@cdo/apps/aiTeacherDrawer/LessonSummaryScreen';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/util/HttpClient');
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: jest.fn(),
}));
jest.mock('@cdo/apps/aiDifferentiation/redux', () => ({
  fetchThreadMessages: jest.fn(args => ({type: 'fetchThreadMessages', args})),
}));
jest.mock('@cdo/apps/sharedComponents/Spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="spinner" />,
}));

const LESSON = {
  lesson_id: 42,
  name: 'Lesson 5: Variables',
  url: '/lessons/42',
  podcast_url: null,
};

const SUMMARY_PAYLOAD = {
  learning_objective: 'Students will understand variables.',
  lesson_beats: ['Introduce variables', 'Practice with examples'],
  tips: ['Use real-world analogies'],
  misconceptions: ['Variables always change'],
};

const DEFAULT_PROPS = {
  lesson: LESSON,
  sectionName: 'Period 3: Intro to CS',
  onBack: jest.fn(),
  onNavigateToChats: jest.fn(),
};

async function renderAndSettle(ui: React.ReactElement) {
  await act(async () => {
    render(ui);
  });
}

describe('LessonSummaryScreen', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      response: {ok: true},
      value: {lesson_summary: JSON.stringify(SUMMARY_PAYLOAD)},
    });
  });

  it('shows lesson name as the header label', async () => {
    await renderAndSettle(<LessonSummaryScreen {...DEFAULT_PROPS} />);
    expect(screen.getByText('Lesson 5: Variables')).toBeInTheDocument();
  });

  it('shows spinner while loading', () => {
    (HttpClient.fetchJson as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<LessonSummaryScreen {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('always shows the Teaching Tips heading', async () => {
    await renderAndSettle(<LessonSummaryScreen {...DEFAULT_PROPS} />);
    expect(screen.getByRole('heading', {name: 'Teaching Tips'})).toBeInTheDocument();
  });

  it('shows summary content after successful fetch', async () => {
    await renderAndSettle(<LessonSummaryScreen {...DEFAULT_PROPS} />);
    await waitFor(() =>
      expect(screen.getByText('Common Misconceptions')).toBeInTheDocument()
    );
    expect(screen.getByText('Variables always change')).toBeInTheDocument();
    expect(screen.getByText('Differentiation Tips')).toBeInTheDocument();
    expect(screen.getByText('Use real-world analogies')).toBeInTheDocument();
    expect(screen.getByText('Key Lesson Beats')).toBeInTheDocument();
    expect(screen.getByText('Introduce variables')).toBeInTheDocument();
    expect(screen.getByText('Learning Objective')).toBeInTheDocument();
    expect(
      screen.getByText('Students will understand variables.')
    ).toBeInTheDocument();
  });

  it('shows no-summary message when API returns not found', async () => {
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      response: {ok: false},
      value: {error: 'not found'},
    });
    await renderAndSettle(<LessonSummaryScreen {...DEFAULT_PROPS} />);
    await waitFor(() =>
      expect(
        screen.getByText(/no lesson summary is available/i)
      ).toBeInTheDocument()
    );
  });

  it('shows no-summary message when fetch throws', async () => {
    (HttpClient.fetchJson as jest.Mock).mockRejectedValue(new Error('network'));
    await renderAndSettle(<LessonSummaryScreen {...DEFAULT_PROPS} />);
    await waitFor(() =>
      expect(
        screen.getByText(/no lesson summary is available/i)
      ).toBeInTheDocument()
    );
  });

  it('shows no-summary message when lesson has no lesson_id', async () => {
    await renderAndSettle(
      <LessonSummaryScreen
        {...DEFAULT_PROPS}
        lesson={{completed_unit: true}}
      />
    );
    expect(
      screen.getByText(/no lesson summary is available/i)
    ).toBeInTheDocument();
    expect(HttpClient.fetchJson).not.toHaveBeenCalled();
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    await renderAndSettle(
      <LessonSummaryScreen {...DEFAULT_PROPS} onBack={onBack} />
    );
    await userEvent.click(screen.getByRole('button', {name: /back/i}));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('dispatches fetchThreadMessages and calls onNavigateToChats when Ask AI TA is clicked', async () => {
    const onNavigateToChats = jest.fn();
    await renderAndSettle(
      <LessonSummaryScreen
        {...DEFAULT_PROPS}
        onNavigateToChats={onNavigateToChats}
      />
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: /ask ai teaching assistant/i})
      ).toBeInTheDocument()
    );
    await userEvent.click(
      screen.getByRole('button', {name: /ask ai teaching assistant/i})
    );
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(onNavigateToChats).toHaveBeenCalledTimes(1);
  });
});
