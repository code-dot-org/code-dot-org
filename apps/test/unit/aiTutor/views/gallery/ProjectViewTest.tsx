import {
  ApiClientProvider,
  createApiClient,
  type RequestOptions,
  type Transport,
} from '@code-dot-org/core/api';
import {
  ChallengeResponse,
  ChallengeResponseDetail,
  GalleryUnit,
} from '@code-dot-org/lesson-deep-dive';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ProjectView from '@cdo/apps/aiTutor/views/gallery/ProjectView';

// The real module eagerly constructs a ky-backed DashboardApiClient singleton
// at import time, which only ever ran under a bundler (webpack/Vite), never
// Jest's CJS runtime; ky ships ESM-only and fails to load there. Standing in
// a lightweight context-only mock avoids exercising that singleton entirely.
jest.mock('@code-dot-org/core/api', () => {
  const {createContext, createElement, useContext} = require('react');
  const ApiClientContext = createContext(null);
  return {
    __esModule: true,
    ApiClientProvider: ({
      client,
      children,
    }: {
      client: unknown;
      children: unknown;
    }) => createElement(ApiClientContext.Provider, {value: client}, children),
    useApiClient: () => {
      const client = useContext(ApiClientContext);
      if (!client) {
        throw new Error('useApiClient must be used within <ApiClientProvider>');
      }
      return client;
    },
    createApiClient: (transport: unknown) => ({transport}),
  };
});

const request = jest.fn();
const transport: Transport = {
  request,
  requestBlob: jest.fn(),
  requestWithMeta: jest.fn(),
};
const client = createApiClient(transport);

const units: GalleryUnit[] = [
  {id: 100, name: 'Problem Solving with AI', position: 1, link: '/s/ai-1'},
];

const detail: ChallengeResponseDetail = {
  id: 8,
  challenge_id: 1,
  user_id: 99,
  user_name: 'Grace Hopper',
  unit_id: 100,
  lesson_position: 3,
  student_text: 'My drawing shows a network.',
  transcript: null,
  student_feedback: 'Great explanation!',
  evaluation_status: 'success',
  is_final: true,
  created_at: '2026-08-10T12:00:00Z',
  assets: [
    {
      id: 3,
      asset_type: 'whiteboard_image',
      download_url: 'https://s3.example/board.png',
    },
  ],
  viewer_role: 'owner',
  question: 'Draw a network.',
  evaluated_at: '2026-08-11T15:30:00Z',
  evaluation_result: null,
  rubric: [],
};

const versionOf = (id: number, created_at: string): ChallengeResponse => ({
  ...detail,
  id,
  created_at,
});

// Routes the mocked transport: /challenge_responses/:id returns the given
// detail, the list endpoint returns the given versions.
const stubFetches = (
  detailResponse: ChallengeResponseDetail,
  versions: ChallengeResponse[] = [detailResponse]
) => {
  request.mockImplementation(({url}: RequestOptions) =>
    url.startsWith('/challenge_responses?')
      ? Promise.resolve(versions)
      : Promise.resolve(detailResponse)
  );
};

const renderView = (
  props: Partial<React.ComponentProps<typeof ProjectView>> = {}
) =>
  render(
    <ApiClientProvider client={client}>
      <ProjectView
        responseId={8}
        units={units}
        galleryResponses={null}
        onBack={jest.fn()}
        onOpenProject={jest.fn()}
        {...props}
      />
    </ApiClientProvider>
  );

describe('ProjectView', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('fetches the project and renders its media, prompt, and details', async () => {
    stubFetches(detail);

    renderView();

    await waitFor(() =>
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    );
    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/challenge_responses/8',
    });

    // The stage and details card render from the fetched detail; their
    // contents are covered by ProjectStageTest and ProjectDetailsCardTest.
    expect(
      screen.getByAltText("Grace Hopper's whiteboard project")
    ).toBeInTheDocument();
    expect(
      screen.getByText('Project Prompt: Draw a network.')
    ).toBeInTheDocument();
    expect(screen.getByText('Unit 1, Lesson 3')).toBeInTheDocument();
  });

  it("pages through the student's responses with the version switcher", async () => {
    const onOpenProject = jest.fn();
    stubFetches(detail, [
      versionOf(4, '2026-08-01T12:00:00Z'),
      versionOf(8, '2026-08-10T12:00:00Z'),
    ]);

    renderView({onOpenProject});

    // The detail fetch renders first; the version list arrives after it.
    await waitFor(() =>
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText('Response #2')).toBeInTheDocument()
    );
    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/challenge_responses?challenge_id=1&user_id=99&sort=oldest',
    });

    expect(screen.getByRole('button', {name: 'Next response'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: 'Previous response'}));
    expect(onOpenProject).toHaveBeenCalledWith(4);
  });

  it('gives the owner a Respond again link back to the lesson tutor', async () => {
    stubFetches(detail);

    renderView();

    await waitFor(() =>
      expect(screen.getByText('Respond again')).toBeInTheDocument()
    );
    expect(screen.getByText('Respond again')).toHaveAttribute(
      'href',
      '/s/ai-1/lessons/3/tutor'
    );
    // Owners see the feedback panel, not the teacher assessment.
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.queryByText('AI Assessment')).not.toBeInTheDocument();
  });

  it('lets a teacher page across the gallery projects', async () => {
    const onOpenProject = jest.fn();
    const teacherDetail = {...detail, viewer_role: 'teacher' as const};
    stubFetches(teacherDetail);
    const galleryResponses = [
      {...versionOf(3, '2026-08-09T12:00:00Z'), user_id: 42, challenge_id: 1},
      versionOf(8, '2026-08-10T12:00:00Z'),
      {...versionOf(9, '2026-08-11T12:00:00Z'), user_id: 7, challenge_id: 1},
    ];

    renderView({galleryResponses, onOpenProject});

    await waitFor(() => expect(screen.getByText('2 of 3')).toBeInTheDocument());
    expect(screen.getByText('AI Assessment')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    expect(onOpenProject).toHaveBeenCalledWith(9);
    fireEvent.click(screen.getByRole('button', {name: 'Previous'}));
    expect(onOpenProject).toHaveBeenCalledWith(3);
  });

  it('shows a peer the project without any feedback panel', async () => {
    stubFetches({
      ...detail,
      viewer_role: 'peer',
      student_feedback: null,
      evaluated_at: null,
    });

    renderView();

    await waitFor(() =>
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    );
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument();
    expect(screen.queryByText('AI Assessment')).not.toBeInTheDocument();
    expect(screen.queryByText('Respond again')).not.toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', async () => {
    request.mockRejectedValue(new Error('network'));

    renderView();

    await waitFor(() =>
      expect(
        screen.getByText(/We couldn't load this project/)
      ).toBeInTheDocument()
    );
  });
});
