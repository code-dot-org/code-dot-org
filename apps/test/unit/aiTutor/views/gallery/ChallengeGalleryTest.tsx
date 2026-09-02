import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ChallengeGallery from '@cdo/apps/aiTutor/views/gallery/ChallengeGallery';
import {addReaction} from '@cdo/apps/aiTutor/views/gallery/reactionsApi';
import {
  ChallengeResponseDetail,
  TutorGalleryData,
} from '@cdo/apps/aiTutor/views/gallery/types';
import {ChallengeResponse} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {fetchJson: jest.fn()},
}));

jest.mock('@cdo/apps/aiTutor/views/gallery/reactionsApi', () => ({
  __esModule: true,
  addReaction: jest.fn(),
  removeReaction: jest.fn(),
}));

const fetchJson = HttpClient.fetchJson as jest.Mock;
const mockAddReaction = addReaction as jest.Mock;

const galleryData: TutorGalleryData = {
  currentUnitId: 100,
  units: [
    {id: 100, name: 'Problem Solving with AI', position: 1, link: '/s/ai-1'},
    {
      id: 200,
      name: 'Foundations of AI Programming',
      position: 2,
      link: '/s/ai-2',
    },
  ],
  sections: [
    {id: 5, name: 'Section 1 - CS Period 3'},
    {id: 6, name: 'Section 2 - CS Period 4'},
  ],
};

const baseResponse: Omit<ChallengeResponse, 'id' | 'user_name' | 'assets'> = {
  challenge_id: 1,
  user_id: 99,
  unit_id: 100,
  lesson_position: 3,
  student_text: null,
  transcript: null,
  student_feedback: null,
  evaluation_status: null,
  is_final: true,
  created_at: '2026-08-10T12:00:00Z',
  reactions: [],
};

const videoResponse: ChallengeResponse = {
  ...baseResponse,
  id: 7,
  user_name: 'Ada Lovelace',
  assets: [
    {id: 1, asset_type: 'video', download_url: 'https://s3.example/video'},
    {id: 2, asset_type: 'audio', download_url: 'https://s3.example/audio'},
  ],
};

const whiteboardResponse: ChallengeResponse = {
  ...baseResponse,
  id: 8,
  user_name: 'Grace Hopper',
  student_text: 'My drawing shows a network.',
  assets: [
    {
      id: 3,
      asset_type: 'whiteboard_image',
      download_url: 'https://s3.example/board.png',
    },
  ],
};

const stubFetches = (
  responses: ChallengeResponse[],
  counts: Record<string, number> = {}
) => {
  fetchJson.mockImplementation((url: string) =>
    url.includes('unit_counts')
      ? Promise.resolve({value: counts})
      : Promise.resolve({value: responses})
  );
};

const whiteboardDetail: ChallengeResponseDetail = {
  ...whiteboardResponse,
  viewer_role: 'peer',
  question: 'Draw a network.',
  evaluated_at: null,
  evaluation_result: null,
  rubric: [],
};

describe('ChallengeGallery', () => {
  beforeEach(() => {
    fetchJson.mockReset();
    mockAddReaction.mockReset();
    // Project navigation pushes ?project=<id>; start each test off a
    // clean URL.
    window.history.replaceState(null, '', '/');
  });

  it('fetches the first section and current unit, and groups projects', async () => {
    stubFetches([videoResponse, whiteboardResponse], {'100': 2});

    render(<ChallengeGallery tutorGalleryData={galleryData} />);

    await waitFor(() =>
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    );
    expect(fetchJson).toHaveBeenCalledWith(
      '/challenge_responses?unit_id=100&section_id=5',
      {},
      expect.any(Function)
    );

    // Grouped into the two design sections.
    expect(screen.getByText('Video Projects')).toBeInTheDocument();
    expect(screen.getByText('Whiteboard Projects')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();

    // Card labels and modality tags.
    expect(screen.getAllByText('Unit 1, Lesson 3')).toHaveLength(2);
    expect(screen.getByText('Video Story')).toBeInTheDocument();
    expect(screen.getByText('Whiteboard')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();

    // The selected section appears in the sidebar dropdown and again as the
    // page header's overline.
    expect(screen.getAllByText('Section 1 - CS Period 3')).toHaveLength(2);
    expect(screen.getByText('Extension Activities')).toBeInTheDocument();
  });

  it('shows unit counts in the sidebar and refetches when a unit is picked', async () => {
    stubFetches([videoResponse], {'100': 4, '200': 2});

    render(<ChallengeGallery tutorGalleryData={galleryData} />);

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(screen.getByText('2')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: /Unit 2: Foundations of AI Programming/,
      })
    );

    await waitFor(() =>
      expect(fetchJson).toHaveBeenCalledWith(
        '/challenge_responses?unit_id=200&section_id=5',
        {},
        expect.any(Function)
      )
    );
  });

  it('refetches with sort=oldest when the sort dropdown changes', async () => {
    stubFetches([videoResponse]);

    render(<ChallengeGallery tutorGalleryData={galleryData} />);
    await waitFor(() =>
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    );

    fireEvent.change(screen.getByDisplayValue('Most recent'), {
      target: {value: 'oldest'},
    });

    await waitFor(() =>
      expect(fetchJson).toHaveBeenCalledWith(
        '/challenge_responses?unit_id=100&section_id=5&sort=oldest',
        {},
        expect.any(Function)
      )
    );
  });

  it('switches to the own-work view via the My projects option', async () => {
    stubFetches([videoResponse]);

    render(<ChallengeGallery tutorGalleryData={galleryData} />);
    await waitFor(() =>
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    );

    fireEvent.change(screen.getByDisplayValue('Section 1 - CS Period 3'), {
      target: {value: 'mine'},
    });

    await waitFor(() =>
      expect(fetchJson).toHaveBeenCalledWith(
        '/challenge_responses?unit_id=100',
        {},
        expect.any(Function)
      )
    );
    expect(screen.getByText('My Projects')).toBeInTheDocument();
  });

  it('fetches without a section when the user has none', async () => {
    stubFetches([]);

    render(
      <ChallengeGallery tutorGalleryData={{...galleryData, sections: []}} />
    );

    await waitFor(() =>
      expect(fetchJson).toHaveBeenCalledWith(
        '/challenge_responses?unit_id=100',
        {},
        expect.any(Function)
      )
    );
    expect(screen.getByText('My Projects')).toBeInTheDocument();
  });

  it('shows an empty state when there are no submissions', async () => {
    stubFetches([]);

    render(<ChallengeGallery tutorGalleryData={galleryData} />);

    await waitFor(() =>
      expect(
        screen.getByText('No projects have been submitted for this unit yet.')
      ).toBeInTheDocument()
    );
  });

  it('shows an error message when the fetch fails', async () => {
    fetchJson.mockRejectedValue(new Error('network'));

    render(<ChallengeGallery tutorGalleryData={galleryData} />);

    await waitFor(() =>
      expect(
        screen.getByText(/We couldn't load the gallery/)
      ).toBeInTheDocument()
    );
  });

  it('opens a project page from a card and returns via the back button', async () => {
    const detail = {
      ...whiteboardResponse,
      viewer_role: 'peer',
      question: 'Draw a network.',
    };
    fetchJson.mockImplementation((url: string) => {
      if (url.startsWith('/challenge_responses/')) {
        return Promise.resolve({value: detail});
      }
      if (url.includes('unit_counts')) {
        return Promise.resolve({value: {}});
      }
      return Promise.resolve({value: [videoResponse, whiteboardResponse]});
    });

    render(<ChallengeGallery tutorGalleryData={galleryData} />);
    await waitFor(() =>
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('link', {name: 'Grace Hopper'}));

    expect(window.location.search).toBe('?project=8');
    await waitFor(() =>
      expect(
        screen.getByText('Project Prompt: Draw a network.')
      ).toBeInTheDocument()
    );
    expect(fetchJson).toHaveBeenCalledWith(
      '/challenge_responses/8',
      {},
      expect.any(Function)
    );

    fireEvent.click(screen.getByRole('button', {name: /project gallery/}));

    expect(window.location.search).toBe('');
    await waitFor(() =>
      expect(screen.getByText('Extension Activities')).toBeInTheDocument()
    );
  });

  it('keeps a reaction made on the project page when returning to the gallery', async () => {
    fetchJson.mockImplementation((url: string) => {
      if (url.startsWith('/challenge_responses/')) {
        return Promise.resolve({value: whiteboardDetail});
      }
      if (url.includes('unit_counts')) {
        return Promise.resolve({value: {}});
      }
      return Promise.resolve({value: [whiteboardResponse]});
    });
    mockAddReaction.mockResolvedValue([
      {emoji: 'heart', count: 1, reacted: true},
    ]);

    render(<ChallengeGallery tutorGalleryData={galleryData} />);
    await waitFor(() =>
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    );

    // Open the project page and add a reaction there.
    fireEvent.click(screen.getByRole('link', {name: 'Grace Hopper'}));
    await waitFor(() =>
      expect(
        screen.getByText('Project Prompt: Draw a network.')
      ).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', {name: 'Add reaction'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Heart'}));
    expect(mockAddReaction).toHaveBeenCalledWith(8, 'heart');

    // Back on the gallery, the card carries the reaction made on the project
    // page rather than the stale empty list from the initial fetch.
    fireEvent.click(screen.getByRole('button', {name: /project gallery/}));
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: /Heart, 1 reaction/})
      ).toBeInTheDocument()
    );
  });
});
