import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {Pathway} from '@cdo/apps/adaptive/types';
import MapScreen from '@cdo/apps/adaptive/views/MapScreen';
import {SKILL_MAP_TOUR_STORAGE_KEY} from '@cdo/apps/adaptive/views/skillMapTourHelpers';

// Stub intro.js-react's Steps as a controllable component that exposes the
// tour callbacks through labeled buttons. forwardRef + useImperativeHandle
// satisfies MapScreen's stepsRef without touching live intro.js DOM logic.
jest.mock('intro.js-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Steps = React.forwardRef(function MockSteps(props: any, ref: any) {
    React.useImperativeHandle(ref, () => ({introJs: {refresh: jest.fn()}}));
    if (!props.enabled) return null;
    return (
      <div role="dialog" aria-label="tour">
        <button type="button" onClick={() => props.onBeforeChange?.(1)}>
          advance
        </button>
        <button type="button" onClick={() => props.onBeforeChange?.(0)}>
          back
        </button>
        <button type="button" onClick={props.onExit}>
          exit
        </button>
        <button type="button" onClick={props.onComplete}>
          done
        </button>
      </div>
    );
  });
  return {Steps};
});

jest.mock('@cdo/apps/adaptive/project/usePathwayProject', () => ({
  usePathwayProject: () => ({isLoading: false}),
}));
jest.mock('@cdo/apps/adaptive/views/map/MapView', () => ({
  __esModule: true,
  default: () => <div aria-label="map" />,
}));
jest.mock('@cdo/apps/adaptive/views/ProjectCard', () => ({
  __esModule: true,
  default: () => <div>project card</div>,
}));
jest.mock('@cdo/apps/adaptive/views/map/mapSettings', () => ({
  resolveMapSettings: () => ({}),
}));
jest.mock('@code-dot-org/component-library/common/contexts', () => ({
  useTheme: () => ({theme: 'Light', setTheme: jest.fn()}),
}));

const step = (id: string) => ({
  id,
  title: id,
  kind: 'panels' as const,
  panels: [{key: `${id}-panel`, imageUrl: 'x.png', text: id}],
});

const pathway: Pathway = {
  formatVersion: 4,
  id: 'tour-test',
  title: 'Tour Pathway',
  objective: 'Learn.',
  project: {templateLevel: 'tmpl', description: 'A project.'},
  skills: {},
  checkpoints: [
    {
      id: 'cp-1',
      title: 'First Checkpoint',
      description: 'Start here.',
      steps: [step('cp-1-a')],
    },
    {
      id: 'cp-2',
      title: 'Second Checkpoint',
      description: 'Next.',
      requires: ['cp-1'],
      steps: [step('cp-2-a')],
    },
  ],
};

const statusMap = {
  'cp-1': 'available' as const,
  'cp-2': 'locked' as const,
};

function renderMapScreen(
  overrides: Partial<React.ComponentProps<typeof MapScreen>> = {}
) {
  return render(
    <MapScreen
      pathway={pathway}
      statusMap={statusMap}
      evidence={{}}
      onFocus={jest.fn()}
      onStart={jest.fn()}
      onWorkOnProject={jest.fn()}
      hasSkippedCheckpoints={false}
      {...overrides}
    />
  );
}

describe('MapScreen tour', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('shows the tour when the storage key is absent', () => {
    renderMapScreen();
    expect(screen.getByRole('dialog', {name: 'tour'})).toBeTruthy();
  });

  it('hides the tour when the storage key is already set', () => {
    localStorage.setItem(SKILL_MAP_TOUR_STORAGE_KEY, '1');
    renderMapScreen();
    expect(screen.queryByRole('dialog', {name: 'tour'})).toBeNull();
  });

  it('dismisses the tour and writes the storage key on exit', () => {
    renderMapScreen();
    act(() => {
      fireEvent.click(screen.getByText('exit'));
    });
    expect(screen.queryByRole('dialog', {name: 'tour'})).toBeNull();
    expect(localStorage.getItem(SKILL_MAP_TOUR_STORAGE_KEY)).toBe('1');
  });

  it('dismisses the tour and writes the storage key on complete', () => {
    renderMapScreen();
    act(() => {
      fireEvent.click(screen.getByText('done'));
    });
    expect(screen.queryByRole('dialog', {name: 'tour'})).toBeNull();
    expect(localStorage.getItem(SKILL_MAP_TOUR_STORAGE_KEY)).toBe('1');
  });

  describe('step transitions', () => {
    it('shows ProjectCard before any step advance', () => {
      renderMapScreen();
      expect(screen.getByText('project card')).toBeTruthy();
      expect(screen.queryByText('First Checkpoint')).toBeNull();
    });

    it('shows CheckpointCard for the first available checkpoint when advancing to step 2', () => {
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance'));
      });
      expect(screen.getByText('First Checkpoint')).toBeTruthy();
      expect(screen.queryByText('project card')).toBeNull();
    });

    it('exposes the start button tour id when CheckpointCard is visible', () => {
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance'));
      });
      expect(
        document.getElementById('adaptive-checkpoint-card-start')
      ).not.toBeNull();
    });

    it('returns to ProjectCard when navigating back to step 1', () => {
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance'));
      });
      act(() => {
        fireEvent.click(screen.getByText('back'));
      });
      expect(screen.getByText('project card')).toBeTruthy();
      expect(screen.queryByText('First Checkpoint')).toBeNull();
    });

    it('shows no CheckpointCard when there is no available checkpoint', () => {
      renderMapScreen({
        statusMap: {'cp-1': 'locked', 'cp-2': 'locked'},
      });
      act(() => {
        fireEvent.click(screen.getByText('advance'));
      });
      // firstAvailableId is undefined → setTourCheckpointId is never called
      expect(screen.getByText('project card')).toBeTruthy();
    });
  });

  describe('with hasSkippedCheckpoints', () => {
    it('does not affect the tour visibility itself', () => {
      renderMapScreen({hasSkippedCheckpoints: true});
      expect(screen.getByRole('dialog', {name: 'tour'})).toBeTruthy();
    });
  });
});
