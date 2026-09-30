import {
  ClassGalleryProject,
  TutorGalleryData,
} from '@code-dot-org/lesson-deep-dive';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ClassProjectGallery from '@cdo/apps/aiTutor/views/gallery/ClassProjectGallery';
import {addReaction} from '@cdo/apps/aiTutor/views/gallery/reactionsApi';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {fetchJson: jest.fn()},
}));

jest.mock('@cdo/apps/aiTutor/views/gallery/reactionsApi', () => ({
  ...jest.requireActual('@cdo/apps/aiTutor/views/gallery/reactionsApi'),
  addReaction: jest.fn(),
  removeReaction: jest.fn(),
}));

const fetchJson = HttpClient.fetchJson as jest.Mock;
const mockAddReaction = addReaction as jest.Mock;

const galleryData: TutorGalleryData = {
  currentUnitId: 100,
  units: [
    {id: 100, name: 'Programming with Music Lab', position: 1, link: '/s/m'},
    {id: 200, name: 'Foundations of AI Programming', position: 2, link: '/s/a'},
  ],
  sections: [{id: 5, name: 'Section 1 - CS Period 3'}],
};

const baseProject: Omit<
  ClassGalleryProject,
  'channel' | 'user_id' | 'user_name'
> = {
  project_type: 'music',
  name: 'My song',
  thumbnail_url: null,
  share_path: null,
  updated_at: '2026-09-30T12:00:00Z',
  unit_id: 100,
  lesson_position: 5,
  lesson_name: 'Mini Project: Walk-Up Songs',
  script_level_id: 11,
  level_position: 9,
  reactions: [],
};

const adaWalkUp: ClassGalleryProject = {
  ...baseProject,
  channel: 'ada-walkup',
  user_id: 1,
  user_name: 'Ada Lovelace',
  share_path: '/projects/music/ada-walkup',
  thumbnail_url: '/v3/files/ada-walkup/.metadata/thumbnail.png',
};

const graceWalkUp: ClassGalleryProject = {
  ...baseProject,
  channel: 'grace-walkup',
  user_id: 2,
  user_name: 'Grace Hopper',
};

const adaGenre: ClassGalleryProject = {
  ...baseProject,
  channel: 'ada-genre',
  user_id: 1,
  user_name: 'Ada Lovelace',
  lesson_position: 13,
  lesson_name: 'Project: Genre Mash-Up',
  script_level_id: 12,
  level_position: 3,
};

const stubFetches = (
  projects: ClassGalleryProject[],
  counts: Record<string, number> = {}
) => {
  fetchJson.mockImplementation((url: string) =>
    url.includes('unit_counts')
      ? Promise.resolve({value: counts})
      : Promise.resolve({value: projects})
  );
};

describe('ClassProjectGallery', () => {
  beforeEach(() => {
    fetchJson.mockReset();
    mockAddReaction.mockReset();
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, true);
  });

  afterEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
  });

  it('fetches the first section and current unit, with counts for every unit', async () => {
    stubFetches([adaWalkUp], {'100': 1});

    render(<ClassProjectGallery tutorGalleryData={galleryData} />);

    await waitFor(() =>
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    );
    expect(fetchJson).toHaveBeenCalledWith(
      '/class_gallery_projects?unit_id=100&section_id=5',
      {},
      expect.any(Function)
    );
    expect(fetchJson).toHaveBeenCalledWith(
      '/class_gallery_projects/unit_counts?unit_ids=100%2C200&section_id=5',
      {},
      expect.any(Function)
    );
    expect(screen.getByText('Class Projects')).toBeInTheDocument();
  });

  it('groups projects by tagged level in lesson order', async () => {
    // The listing is newest first, so the later lesson arrives first.
    stubFetches([adaGenre, graceWalkUp, adaWalkUp]);

    render(<ClassProjectGallery tutorGalleryData={galleryData} />);

    await waitFor(() =>
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    );
    const groupTitles = within(screen.getByRole('main'))
      .getAllByRole('heading', {level: 2})
      .map(h => h.textContent);
    expect(groupTitles).toEqual([
      'Mini Project: Walk-Up Songs',
      'Project: Genre Mash-Up',
    ]);
    expect(screen.getByText('2 projects')).toBeInTheDocument();
    expect(screen.getByText('1 project')).toBeInTheDocument();
    expect(screen.getByText('Unit 1, Lesson 13')).toBeInTheDocument();
  });

  it('links a project with a share view to it in a new tab', async () => {
    stubFetches([adaWalkUp, graceWalkUp]);

    render(<ClassProjectGallery tutorGalleryData={galleryData} />);

    const link = await screen.findByRole('link', {name: 'Ada Lovelace'});
    expect(link).toHaveAttribute('href', '/projects/music/ada-walkup');
    expect(link).toHaveAttribute('target', '_blank');
    // No share path, no link.
    expect(
      screen.queryByRole('link', {name: 'Grace Hopper'})
    ).not.toBeInTheDocument();
    expect(screen.getByAltText("Ada Lovelace's project")).toHaveAttribute(
      'src',
      '/v3/files/ada-walkup/.metadata/thumbnail.png'
    );
  });

  it('reacts through the class gallery reactions endpoint', async () => {
    stubFetches([adaWalkUp]);
    mockAddReaction.mockResolvedValue([
      {emoji: 'heart', count: 1, reacted: true},
    ]);

    render(<ClassProjectGallery tutorGalleryData={galleryData} />);

    fireEvent.click(await screen.findByRole('button', {name: 'Add reaction'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Heart'}));

    await waitFor(() =>
      expect(mockAddReaction).toHaveBeenCalledWith(
        '/class_gallery_projects/ada-walkup/reactions',
        'heart'
      )
    );
  });

  it('shows an empty state when the unit has no saved projects', async () => {
    stubFetches([]);

    render(<ClassProjectGallery tutorGalleryData={galleryData} />);

    expect(
      await screen.findByText('No projects have been saved for this unit yet.')
    ).toBeInTheDocument();
  });

  it('refetches the own-work listing via the My projects option', async () => {
    stubFetches([adaWalkUp]);

    render(<ClassProjectGallery tutorGalleryData={galleryData} />);
    await screen.findByText('Ada Lovelace');

    fireEvent.change(screen.getByDisplayValue('Section 1 - CS Period 3'), {
      target: {value: 'mine'},
    });

    await waitFor(() =>
      expect(fetchJson).toHaveBeenCalledWith(
        '/class_gallery_projects?unit_id=100',
        {},
        expect.any(Function)
      )
    );
  });

  it('renders nothing when the experiment is off', () => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
    stubFetches([]);

    const {container} = render(
      <ClassProjectGallery tutorGalleryData={galleryData} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
