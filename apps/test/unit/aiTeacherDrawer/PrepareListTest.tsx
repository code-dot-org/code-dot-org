import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PrepareList from '@cdo/apps/aiTeacherDrawer/PrepareList';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/util/HttpClient');

jest.mock('@code-dot-org/teacher-dashboard/redux', () => ({
  asyncLoadSectionData: () => () => Promise.resolve(),
}));

jest.mock('@code-dot-org/teacher-dashboard/home', () => ({
  __esModule: true,
  default: () => <span role="img" aria-label="section-avatar" />,
}));

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn(),
}));

const SECTION_STATE_EMPTY = {sectionIds: [], sections: {}};

function makeSectionsState(
  sections: {
    id: number;
    name: string;
    hidden?: boolean;
    participantType?: string;
    avatar_color?: number;
    avatar_emoji?: number;
  }[]
) {
  return {
    sectionIds: sections.map(s => s.id),
    sections: Object.fromEntries(
      sections.map(s => [
        s.id,
        {
          id: s.id,
          name: s.name,
          hidden: s.hidden ?? false,
          participantType: s.participantType ?? 'student',
          avatar_color: s.avatar_color ?? 0,
          avatar_emoji: s.avatar_emoji ?? 0,
        },
      ])
    ),
  };
}

describe('PrepareList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({value: {}});
    (useAppSelector as jest.Mock).mockReturnValue(SECTION_STATE_EMPTY);
  });

  it('renders the Prepare heading', () => {
    render(<PrepareList />);
    expect(screen.getByText('Prepare')).toBeInTheDocument();
  });

  it('renders the date picker label', () => {
    render(<PrepareList />);
    expect(screen.getByText('Show prep content for')).toBeInTheDocument();
  });

  it('renders the current year in the date picker', () => {
    render(<PrepareList />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('shows empty state when there are no active sections', () => {
    render(<PrepareList />);
    expect(screen.getByText(/No active sections found/)).toBeInTheDocument();
  });

  it('renders section names for active student sections', () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([
        {id: 1, name: 'Period 1: Intro to CS'},
        {id: 2, name: 'Period 2: Game Design'},
      ])
    );
    render(<PrepareList />);
    expect(screen.getByText('Period 1: Intro to CS')).toBeInTheDocument();
    expect(screen.getByText('Period 2: Game Design')).toBeInTheDocument();
  });

  it('excludes hidden sections', () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([
        {id: 1, name: 'Period 1: Intro to CS', hidden: true},
        {id: 2, name: 'Period 2: Game Design'},
      ])
    );
    render(<PrepareList />);
    expect(screen.queryByText('Period 1: Intro to CS')).not.toBeInTheDocument();
    expect(screen.getByText('Period 2: Game Design')).toBeInTheDocument();
  });

  it('renders an audio element only for sections with a podcast_url', async () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([
        {id: 1, name: 'Period 1: Intro to CS'},
        {id: 2, name: 'Period 2: Game Design'},
      ])
    );
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      value: {
        1: {
          lesson_id: 10,
          podcast_url: '/ai_lesson_summary_podcasts/show?lesson_id=10',
        },
        2: {lesson_id: 20, podcast_url: null},
      },
    });

    render(<PrepareList />);

    await waitFor(() => {
      expect(document.querySelectorAll('audio')).toHaveLength(1);
    });
  });

  it('renders no audio elements when all sections have null podcast_url', async () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([
        {id: 1, name: 'Period 1: Intro to CS'},
        {id: 2, name: 'Period 2: Game Design'},
      ])
    );
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      value: {
        1: {lesson_id: 10, podcast_url: null},
        2: {lesson_id: 20, podcast_url: null},
      },
    });

    render(<PrepareList />);

    await waitFor(() => {
      expect(document.querySelectorAll('audio')).toHaveLength(0);
    });
  });
});
