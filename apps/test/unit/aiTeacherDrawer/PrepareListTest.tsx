import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import PrepareList from '@cdo/apps/aiTeacherDrawer/PrepareList';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/util/HttpClient');

jest.mock('@cdo/apps/templates/teacherDashboard/teacherSectionsRedux', () => ({
  asyncLoadSectionData: () => () => Promise.resolve(),
}));

jest.mock(
  '@cdo/apps/templates/studioHomepages/teacherHomepageV2/sectionAvatars/SectionAvatar',
  () => ({
    __esModule: true,
    default: () => <span role="img" aria-label="section-avatar" />,
  })
);

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

function makeLessonData(overrides = {}) {
  return {
    lesson_id: 10,
    name: 'Lesson 1: Intro',
    url: '/lessons/1',
    podcast_url: null,
    history: [],
    coming_up: null,
    ...overrides,
  };
}

async function renderAndSettle(ui: React.ReactElement) {
  await act(async () => {
    render(ui);
  });
}

describe('PrepareList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({value: {}});
    (useAppSelector as jest.Mock).mockReturnValue(SECTION_STATE_EMPTY);
  });

  it('renders the Prepare heading', async () => {
    await renderAndSettle(<PrepareList />);
    expect(screen.getByText('Prepare')).toBeInTheDocument();
  });

  it('renders the date picker label', async () => {
    await renderAndSettle(<PrepareList />);
    expect(screen.getByText('Show prep content for')).toBeInTheDocument();
  });

  it('renders the current year in the date picker', async () => {
    await renderAndSettle(<PrepareList />);
    const year = new Date().getFullYear().toString();
    expect(
      screen.getByRole('option', {name: new RegExp(year)})
    ).toBeInTheDocument();
  });

  it('shows empty state when there are no active sections', async () => {
    await renderAndSettle(<PrepareList />);
    expect(screen.getByText(/No active sections found/)).toBeInTheDocument();
  });

  it('renders section names for active student sections', async () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([
        {id: 1, name: 'Period 1: Intro to CS'},
        {id: 2, name: 'Period 2: Game Design'},
      ])
    );
    await renderAndSettle(<PrepareList />);
    expect(screen.getByText('Period 1: Intro to CS')).toBeInTheDocument();
    expect(screen.getByText('Period 2: Game Design')).toBeInTheDocument();
  });

  it('excludes hidden sections', async () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([
        {id: 1, name: 'Period 1: Intro to CS', hidden: true},
        {id: 2, name: 'Period 2: Game Design'},
      ])
    );
    await renderAndSettle(<PrepareList />);
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
        1: makeLessonData({
          lesson_id: 10,
          podcast_url: '/ai_lesson_summary_podcasts/show?lesson_id=10',
        }),
        2: makeLessonData({lesson_id: 20, podcast_url: null}),
      },
    });

    await renderAndSettle(<PrepareList />);
    expect(document.querySelectorAll('audio')).toHaveLength(1);
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
        1: makeLessonData({lesson_id: 10, podcast_url: null}),
        2: makeLessonData({lesson_id: 20, podcast_url: null}),
      },
    });

    await renderAndSettle(<PrepareList />);
    expect(document.querySelectorAll('audio')).toHaveLength(0);
  });

  it('displays lesson name below section name', async () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([{id: 1, name: 'Period 1: Intro to CS'}])
    );
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      value: {
        1: makeLessonData({name: 'Lesson 5: Functions'}),
      },
    });

    await renderAndSettle(<PrepareList />);
    expect(screen.getByText('Lesson 5: Functions')).toBeInTheDocument();
  });

  it('shows completed unit message when lesson has completed_unit flag', async () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([{id: 1, name: 'Period 1: Intro to CS'}])
    );
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      value: {1: {completed_unit: true, history: [], coming_up: null}},
    });

    await renderAndSettle(<PrepareList />);
    expect(screen.getByText(/finishing this unit/i)).toBeInTheDocument();
  });

  it('adds Coming up option to date picker when coming_up data is present', async () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([{id: 1, name: 'Period 1: Intro to CS'}])
    );
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      value: {
        1: makeLessonData({
          coming_up: {
            lesson_id: 20,
            name: 'Lesson 2: Loops',
            url: '/lessons/2',
            podcast_url: null,
          },
        }),
      },
    });

    await renderAndSettle(<PrepareList />);
    expect(screen.getByRole('option', {name: 'Coming up'})).toBeInTheDocument();
  });

  it('shows coming_up lesson when Coming up option is selected', async () => {
    const user = userEvent.setup();
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([{id: 1, name: 'Period 1: Intro to CS'}])
    );
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      value: {
        1: makeLessonData({
          name: 'Lesson 1: Intro',
          coming_up: {
            lesson_id: 20,
            name: 'Lesson 2: Loops',
            url: '/lessons/2',
            podcast_url: null,
          },
        }),
      },
    });

    await renderAndSettle(<PrepareList />);
    await user.selectOptions(
      screen.getByRole('combobox', {name: 'Show prep content for'}),
      'Coming up'
    );

    await waitFor(() =>
      expect(screen.getByText('Lesson 2: Loops')).toBeInTheDocument()
    );
  });

  it('populates history dates in date picker', async () => {
    (useAppSelector as jest.Mock).mockReturnValue(
      makeSectionsState([{id: 1, name: 'Period 1: Intro to CS'}])
    );
    (HttpClient.fetchJson as jest.Mock).mockResolvedValue({
      value: {
        1: makeLessonData({
          history: [
            {
              lesson_id: 5,
              name: 'Lesson 5',
              date: '2026-07-15',
              url: '/lessons/5',
              podcast_url: null,
            },
          ],
        }),
      },
    });

    await renderAndSettle(<PrepareList />);
    expect(screen.getByRole('option', {name: /July 15/})).toBeInTheDocument();
  });
});
