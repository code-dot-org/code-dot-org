import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {Pathway} from '@cdo/apps/adaptive/types';
import MapScreen from '@cdo/apps/adaptive/views/MapScreen';
import {SKILL_MAP_TOUR_STORAGE_KEY} from '@cdo/apps/adaptive/views/skillMapTourHelpers';

// Stub intro.js-react's Steps as a controllable component.
// - "advance" / "back" fire onBeforeChange + onChange so MapScreen's tourStep
//   state stays in sync.
// - ref exposes introJs.nextStep, which the onSelect handler calls when the
//   user picks a checkpoint during step 1.
jest.mock('intro.js-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Steps = React.forwardRef(function MockSteps(props: any, ref: any) {
    const propsRef = React.useRef(props);
    propsRef.current = props;
    const stepRef = React.useRef(0);

    React.useImperativeHandle(ref, () => ({
      introJs: {
        refresh: jest.fn(),
        nextStep: () => {
          const next = stepRef.current + 1;
          propsRef.current.onBeforeChange?.(next);
          stepRef.current = next;
          propsRef.current.onChange?.(next);
        },
      },
    }));

    if (!props.enabled) return null;

    const advance = (nextStep: number) => {
      props.onBeforeChange?.(nextStep);
      stepRef.current = nextStep;
      props.onChange?.(nextStep);
    };

    return (
      <div role="dialog" aria-label="tour">
        <button type="button" onClick={() => advance(1)}>
          advance
        </button>
        <button type="button" onClick={() => advance(0)}>
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

// MapView mock exposes onSelect so tests can simulate a checkpoint click.
jest.mock('@cdo/apps/adaptive/views/map/MapView', () => ({
  __esModule: true,
  default: ({onSelect}: {onSelect?: (id: string) => void}) => (
    <div aria-label="map">
      <button type="button" onClick={() => onSelect?.('cp-1')}>
        select cp-1
      </button>
      <button type="button" onClick={() => onSelect?.('cp-2')}>
        select cp-2
      </button>
    </div>
  ),
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
    document.body.classList.remove('adaptive-tour-step-select');
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
    it('shows ProjectCard before any interaction', () => {
      renderMapScreen();
      expect(screen.getByText('project card')).toBeTruthy();
      expect(screen.queryByText('First Checkpoint')).toBeNull();
    });

    it('still shows ProjectCard after advancing to step 2 without a map click', () => {
      // Advancing no longer auto-selects a checkpoint — user must click the map.
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance'));
      });
      expect(screen.getByText('project card')).toBeTruthy();
      expect(screen.queryByText('First Checkpoint')).toBeNull();
    });

    it('shows CheckpointCard after the user selects a checkpoint on the map', () => {
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance')); // step 1
      });
      act(() => {
        fireEvent.click(screen.getByText('select cp-1'));
      });
      expect(screen.getByText('First Checkpoint')).toBeTruthy();
      expect(screen.queryByText('project card')).toBeNull();
    });

    it('exposes the start button tour id once CheckpointCard is visible', () => {
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance'));
      });
      act(() => {
        fireEvent.click(screen.getByText('select cp-1'));
      });
      expect(
        document.getElementById('adaptive-checkpoint-card-start')
      ).not.toBeNull();
    });

    it('ignores map clicks on locked checkpoints during the select step', () => {
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance')); // step 1
      });
      act(() => {
        fireEvent.click(screen.getByText('select cp-2')); // cp-2 is locked
      });
      expect(screen.getByText('project card')).toBeTruthy();
      expect(screen.queryByText('Second Checkpoint')).toBeNull();
    });

    it('clears CheckpointCard when navigating back to step 1', () => {
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance')); // step 1
      });
      act(() => {
        fireEvent.click(screen.getByText('select cp-1')); // step 2 with checkpoint
      });
      act(() => {
        fireEvent.click(screen.getByText('back')); // step 0
      });
      expect(screen.getByText('project card')).toBeTruthy();
      expect(screen.queryByText('First Checkpoint')).toBeNull();
    });

    it('adds the select body class when on step 2 and removes it on advance', () => {
      renderMapScreen();
      act(() => {
        fireEvent.click(screen.getByText('advance')); // step 1
      });
      expect(
        document.body.classList.contains('adaptive-tour-step-select')
      ).toBe(true);
      act(() => {
        fireEvent.click(screen.getByText('select cp-1')); // step 2 via nextStep
      });
      expect(
        document.body.classList.contains('adaptive-tour-step-select')
      ).toBe(false);
    });
  });

  describe('with hasSkippedCheckpoints', () => {
    it('does not affect the tour visibility itself', () => {
      renderMapScreen({hasSkippedCheckpoints: true});
      expect(screen.getByRole('dialog', {name: 'tour'})).toBeTruthy();
    });
  });
});
