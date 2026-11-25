import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AdaptiveStatsWidget from '@cdo/apps/templates/studentSnapshot/adaptiveStatsWidget';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {fetchJson: jest.fn()},
}));

const HttpClient = require('@cdo/apps/util/HttpClient').default as {
  fetchJson: jest.Mock;
};

const step = (id: string) => ({
  id: `${id}-step`,
  title: id,
  kind: 'panels',
  panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
});

const checkpoint = (id: string, requires?: string[], destination?: string) => ({
  id,
  title: `Checkpoint ${id}`,
  description: id,
  requires,
  destination,
  steps: [step(id)],
});

const pathway = (stats?: string[]) => ({
  formatVersion: 4,
  id: 'p',
  title: 'Pathway',
  objective: 'Build a site.',
  project: {templateLevel: 'template', description: 'A site.'},
  skills: {build: {id: 'build', title: 'Build', description: 'B.'}},
  destinations: {north: {title: 'North', icon: 'wrench', color: 'orange'}},
  checkpoints: [
    {...checkpoint('intro'), skillIds: ['build']},
    {...checkpoint('a', ['intro']), skillIds: ['build']},
    checkpoint('b', ['a'], 'north'),
    {
      ...checkpoint('wrap', ['a']),
      steps: [
        {
          id: 'wrap-stats',
          title: 'Great job!',
          kind: 'stats',
          heading: 'Great job!',
          ...(stats && {stats}),
        },
      ],
    },
  ],
});

const PROGRESS = {
  steps: {
    'intro-step': {status: 'complete', timeSpent: 0},
    'a-step': {status: 'started', timeSpent: 0},
  },
};

const respondWith = (value: unknown) =>
  HttpClient.fetchJson.mockResolvedValue({value, response: new Response()});

const renderWidget = (
  props: Partial<React.ComponentProps<typeof AdaptiveStatsWidget>> = {}
) =>
  render(
    <AdaptiveStatsWidget
      selectedUnitId={1}
      selectedLessonId={2}
      selectedStudentId={3}
      hasAdaptiveLevel={true}
      {...props}
    />
  );

const figure = (label: string) => screen.getByText(label).closest('div');

describe('AdaptiveStatsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders nothing for a lesson without an adaptive level', () => {
    const {container} = renderWidget({hasAdaptiveLevel: false});

    expect(container).toBeEmptyDOMElement();
    expect(HttpClient.fetchJson).not.toHaveBeenCalled();
  });

  it('renders nothing, without fetching, when no student is selected', () => {
    const {container} = renderWidget({selectedStudentId: null});

    expect(container).toBeEmptyDOMElement();
    expect(HttpClient.fetchJson).not.toHaveBeenCalled();
  });

  it('renders nothing while loading', () => {
    HttpClient.fetchJson.mockReturnValue(new Promise(() => {}));

    const {container} = renderWidget();

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the student's checkpoints, AI changes, skills and focus areas", async () => {
    respondWith({
      pathway: pathway(),
      progress: PROGRESS,
      aiMetrics: {accepted: 4, rejected: 1},
    });

    renderWidget();

    expect(HttpClient.fetchJson).toHaveBeenCalledWith(
      '/student_snapshots/units/1/lessons/2/students/3/adaptive'
    );
    expect(
      await screen.findByText('Checkpoints completed')
    ).toBeInTheDocument();
    expect(figure('Checkpoints completed')).toHaveTextContent('1');
    expect(figure('AI changes accepted')).toHaveTextContent('4');
    expect(figure('AI changes rejected')).toHaveTextContent('1');
    expect(
      screen.getByRole('button', {name: 'Build: 1 of 2 checkpoints complete'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'North: 0 of 1 checkpoints complete'})
    ).toBeInTheDocument();
  });

  it('leaves out the AI changes without counts', async () => {
    respondWith({pathway: pathway(), progress: PROGRESS});

    renderWidget();

    await screen.findByText('Checkpoints completed');
    expect(screen.queryByText('AI changes accepted')).not.toBeInTheDocument();
    expect(screen.queryByText('AI changes rejected')).not.toBeInTheDocument();
  });

  it("shows only the figures the pathway's stats step names", async () => {
    respondWith({
      pathway: pathway(['skills', 'checkpoints']),
      progress: PROGRESS,
      aiMetrics: {accepted: 4, rejected: 1},
    });

    renderWidget();

    await screen.findByText('Checkpoints completed');
    expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual([
      'Skill mastery',
      'Checkpoints completed',
    ]);
  });

  it('shows the unavailable message when the fetch fails', async () => {
    HttpClient.fetchJson.mockRejectedValue(new Error('forbidden'));

    renderWidget();

    expect(await screen.findByText('Stats unavailable.')).toBeInTheDocument();
  });
});
