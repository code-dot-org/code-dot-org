import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AdaptiveSkillMapWidget from '@cdo/apps/templates/studentSnapshot/adaptiveSkillMapWidget';

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

const PATHWAY = {
  formatVersion: 4,
  id: 'p',
  title: 'Pathway',
  objective: 'Build a site.',
  project: {templateLevel: 'template', description: 'A site.'},
  skills: {},
  checkpoints: [
    checkpoint('intro'),
    checkpoint('a', ['intro']),
    checkpoint('b', ['a'], 'Outpost'),
  ],
};

const PROGRESS = {
  steps: {
    'intro-step': {status: 'complete', timeSpent: 0},
    'a-step': {status: 'started', timeSpent: 0},
  },
};

const respondWith = (value: unknown) =>
  HttpClient.fetchJson.mockResolvedValue({value, response: new Response()});

const renderWidget = (
  props: Partial<React.ComponentProps<typeof AdaptiveSkillMapWidget>> = {}
) =>
  render(
    <AdaptiveSkillMapWidget
      selectedUnitId={1}
      selectedLessonId={2}
      selectedStudentId={3}
      hasAdaptiveLevel={true}
      {...props}
    />
  );

describe('AdaptiveSkillMapWidget', () => {
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

  it('asks for a student, without fetching, when none is selected', () => {
    renderWidget({selectedStudentId: null});

    expect(
      screen.getByText('Select a student to see their skill map.')
    ).toBeInTheDocument();
    expect(HttpClient.fetchJson).not.toHaveBeenCalled();
  });

  it('shows a spinner while loading', () => {
    HttpClient.fetchJson.mockReturnValue(new Promise(() => {}));

    renderWidget();

    expect(document.getElementById('uitest-spinner')).toBeInTheDocument();
  });

  it("shows each checkpoint in the student's status", async () => {
    respondWith({pathway: PATHWAY, progress: PROGRESS});

    renderWidget();

    expect(HttpClient.fetchJson).toHaveBeenCalledWith(
      '/student_snapshots/units/1/lessons/2/students/3/adaptive'
    );
    expect(
      await screen.findByRole('button', {name: 'Checkpoint intro: Complete'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Checkpoint a: In progress'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Checkpoint b: Locked'})
    ).toBeInTheDocument();
  });

  it('shows the unavailable message when the fetch fails', async () => {
    HttpClient.fetchJson.mockRejectedValue(new Error('forbidden'));

    renderWidget();

    expect(
      await screen.findByText('Skill map unavailable.')
    ).toBeInTheDocument();
  });

  it('shows the unavailable message when there is no pathway', async () => {
    respondWith({pathway: null, progress: null});

    renderWidget();

    expect(
      await screen.findByText('Skill map unavailable.')
    ).toBeInTheDocument();
  });

  it("ignores the page's map layout parameter", async () => {
    window.history.replaceState(null, '', '/?mapLayout=destinations');
    respondWith({pathway: PATHWAY, progress: PROGRESS});

    renderWidget();

    await screen.findByRole('button', {name: 'Checkpoint intro: Complete'});
    // Only the destinations layout draws a destination's title.
    expect(screen.queryByText('Outpost')).not.toBeInTheDocument();
  });

  it('zooms in and out from the starting zoom, and back to it', async () => {
    respondWith({pathway: PATHWAY, progress: PROGRESS});
    renderWidget();
    const zoomIn = await screen.findByRole('button', {name: 'Zoom in'});
    const zoomOut = screen.getByRole('button', {name: 'Zoom out'});
    const reset = screen.getByRole('button', {name: 'Reset zoom'});

    expect(reset).toBeDisabled();
    expect(zoomOut).toBeEnabled();

    fireEvent.click(zoomIn);
    expect(reset).toBeEnabled();

    fireEvent.click(reset);
    expect(reset).toBeDisabled();

    fireEvent.click(zoomOut);
    expect(reset).toBeEnabled();

    fireEvent.click(zoomIn);
    expect(reset).toBeDisabled();
  });

  it('stops zooming out at a quarter of the width', async () => {
    respondWith({pathway: PATHWAY, progress: PROGRESS});
    renderWidget();
    const zoomOut = await screen.findByRole('button', {name: 'Zoom out'});

    fireEvent.click(zoomOut);
    expect(zoomOut).toBeEnabled();
    fireEvent.click(zoomOut);

    expect(zoomOut).toBeDisabled();
  });

  it('stops zooming in at twice the width', async () => {
    respondWith({pathway: PATHWAY, progress: PROGRESS});
    renderWidget();
    const zoomIn = await screen.findByRole('button', {name: 'Zoom in'});

    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    expect(zoomIn).toBeEnabled();
    fireEvent.click(zoomIn);

    expect(zoomIn).toBeDisabled();
  });

  it('shows no zoom controls without a map', () => {
    renderWidget({selectedStudentId: null});

    expect(
      screen.queryByRole('button', {name: 'Zoom in'})
    ).not.toBeInTheDocument();
  });

  describe('measured', () => {
    const WIDTH = 400;
    const HEIGHT = 200;

    const originalResizeObserver = window.ResizeObserver;

    beforeEach(() => {
      // jsdom lays nothing out, so the map measures this box.
      window.ResizeObserver = class {
        observe() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver;
      jest
        .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
        .mockReturnValue(WIDTH);
      jest
        .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
        .mockReturnValue(HEIGHT);
    });

    afterEach(() => {
      window.ResizeObserver = originalResizeObserver;
    });

    it('opens with the root checkpoint at the center of the view', async () => {
      // Where the root's circle sits in the scrolled content.
      const ROOT = {x: 300, y: 500, size: 20};
      const box = (left: number, top: number, width: number, height: number) =>
        ({left, top, width, height} as DOMRect);
      jest
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockImplementation(function (this: HTMLElement) {
          if (this.dataset.checkpointId !== 'intro') {
            return box(0, 0, WIDTH, HEIGHT);
          }
          const view = this.closest('.view') as HTMLElement;
          return box(
            ROOT.x - view.scrollLeft,
            ROOT.y - view.scrollTop,
            ROOT.size,
            ROOT.size
          );
        });
      respondWith({pathway: PATHWAY, progress: PROGRESS});
      renderWidget();
      const root = await screen.findByRole('button', {
        name: 'Checkpoint intro: Complete',
      });

      const view = root.closest('.view') as HTMLElement;
      expect(view.scrollLeft).toBeCloseTo(ROOT.x + ROOT.size / 2 - WIDTH / 2);
      expect(view.scrollTop).toBeCloseTo(ROOT.y + ROOT.size / 2 - HEIGHT / 2);
    });
  });

  it('does nothing when a checkpoint is pressed', async () => {
    respondWith({pathway: PATHWAY, progress: PROGRESS});
    renderWidget();
    const node = await screen.findByRole('button', {
      name: 'Checkpoint a: In progress',
    });
    const before = document.body.innerHTML;

    fireEvent.click(node);

    await waitFor(() => expect(document.body.innerHTML).toBe(before));
    expect(HttpClient.fetchJson).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe('/');
  });
});
