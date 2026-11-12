import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {Pathway} from '@cdo/apps/adaptive/types';
import MapScreen from '@cdo/apps/adaptive/views/MapScreen';
import {SKILL_MAP_TOUR_STORAGE_KEY} from '@cdo/apps/adaptive/views/skillMapTourHelpers';
import DCDO from '@cdo/apps/dcdo';

// Mock createTourWithSteps so tests get a controllable Tour object without
// needing a real Shepherd instance. The mock replicates the lifecycle used
// by MapScreen: addSteps → start → show events → cancel/complete events.
jest.mock('@cdo/apps/sharedComponents/productTour/productTourHelpers', () => ({
  ...jest.requireActual(
    '@cdo/apps/sharedComponents/productTour/productTourHelpers'
  ),
  createTourWithSteps: jest.fn(),
}));

jest.mock('@cdo/apps/sharedComponents/productTour/activeTourTracker', () => ({
  registerActiveTour: jest.fn(),
}));

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {
    get: jest.fn((_key: string, defaultValue: unknown) => defaultValue),
  },
}));

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

const mockHideStats = false;
jest.mock('@cdo/apps/adaptive/views/map/mapSettings', () => ({
  resolveMapSettings: () => ({hideStats: mockHideStats}),
}));
jest.mock('@cdo/apps/lab2/hooks/useThemeSetting', () => ({
  __esModule: true,
  default: () => ({
    id: 'theme',
    label: 'Theme',
    options: [],
    selectedValue: 'Light',
    onChange: jest.fn(),
  }),
}));
jest.mock('@cdo/apps/lab2/views/components/Instructions/ResourcePanel', () => ({
  __esModule: true,
  default: ({
    sidebarOnly,
    settings,
  }: {
    sidebarOnly?: boolean;
    settings?: {id: string}[];
  }) => (
    <div>
      resource rail{sidebarOnly ? ' (sidebar only)' : ''}: settings{' '}
      {settings?.map(s => s.id).join(',')}
    </div>
  ),
}));

// --- Tour mock helpers ---

// Set in beforeEach; null means tourEnabled was false and no tour was created.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createdTour: any = null;

function setupMockTour() {
  createdTour = null;
  // Clear localStorage before each test. RTL's cleanup (which unmounts the
  // previous component) runs after our afterEach, so an active tour's cancel()
  // path can write SKILL_MAP_TOUR_STORAGE_KEY='1' after we cleared it. A
  // beforeEach clear avoids that contaminating the next test's tourEnabled
  // initial-state computation.
  localStorage.clear();

  const {createTourWithSteps} = jest.requireMock(
    '@cdo/apps/sharedComponents/productTour/productTourHelpers'
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createTourWithSteps.mockImplementation((getSteps: (t: any) => any[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const steps: any[] = [];
    const listeners: Record<string, Array<() => void>> = {};
    let stepIdx = -1;

    const fireEvent = (event: string) => {
      (listeners[event] ?? []).forEach(fn => fn());
    };

    const showStep = (idx: number) => {
      stepIdx = idx;
      steps[idx]?.when?.show?.();
      fireEvent('show');
    };

    const hideCurrentStep = () => {
      if (stepIdx >= 0) steps[stepIdx]?.when?.hide?.();
    };

    const tour = {
      get steps() {
        return steps;
      },
      get currentStep() {
        return steps[stepIdx] ?? null;
      },
      isActive: () => stepIdx >= 0,
      on: (event: string, fn: () => void) => {
        (listeners[event] = listeners[event] ?? []).push(fn);
        return tour;
      },
      start: () => {
        showStep(0);
        fireEvent('start');
      },
      next: () => {
        hideCurrentStep();
        if (stepIdx < steps.length - 1) showStep(stepIdx + 1);
        else tour.complete();
      },
      back: () => {
        if (stepIdx > 0) {
          hideCurrentStep();
          showStep(stepIdx - 1);
        }
      },
      cancel: () => {
        hideCurrentStep();
        stepIdx = -1;
        fireEvent('cancel');
      },
      complete: () => {
        hideCurrentStep();
        stepIdx = -1;
        fireEvent('complete');
      },
    };

    // Replicate createTourWithSteps: call getSteps with the tour, then add them.
    const rawSteps = getSteps(tour);
    steps.push(...rawSteps);

    createdTour = tour;
    return tour;
  });
}

// --- Fixtures ---

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
      levelProperties={{id: 1, name: 'adaptive', appName: 'adaptive'}}
      statusMap={statusMap}
      evidence={{}}
      onFocus={jest.fn()}
      onStart={jest.fn()}
      hasSkippedCheckpoints={false}
      {...overrides}
    />
  );
}

// --- Tests ---

describe('MapScreen tour', () => {
  beforeEach(() => {
    setupMockTour();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('adaptive-tour-step-select');
    jest.clearAllMocks();
    (DCDO.get as jest.Mock).mockImplementation(
      (_key: string, defaultValue: unknown) => defaultValue
    );
  });

  it('starts the tour when the storage key is absent', () => {
    renderMapScreen();
    expect(createdTour).not.toBeNull();
    expect(createdTour.isActive()).toBe(true);
  });

  it('does not start the tour when the storage key is already set', () => {
    localStorage.setItem(SKILL_MAP_TOUR_STORAGE_KEY, '1');
    renderMapScreen();
    expect(createdTour).toBeNull();
  });

  it('writes the storage key and ends the tour on cancel', () => {
    renderMapScreen();
    act(() => {
      createdTour.cancel();
    });
    expect(createdTour.isActive()).toBe(false);
    expect(localStorage.getItem(SKILL_MAP_TOUR_STORAGE_KEY)).toBe('1');
  });

  it('writes the storage key and ends the tour on complete', () => {
    renderMapScreen();
    act(() => {
      createdTour.complete();
    });
    expect(createdTour.isActive()).toBe(false);
    expect(localStorage.getItem(SKILL_MAP_TOUR_STORAGE_KEY)).toBe('1');
  });

  describe('step transitions', () => {
    it('shows "Select a checkpoint" prompt before any interaction', () => {
      renderMapScreen();
      expect(screen.getByText('Select a checkpoint')).toBeTruthy();
      expect(screen.queryByText('First Checkpoint')).toBeNull();
    });

    it('shows CheckpointCard after the user selects a checkpoint on the map', () => {
      renderMapScreen();
      act(() => {
        createdTour.next(); // → step 1
      });
      act(() => {
        createdTour.next(); // → step 2 (pick checkpoint)
      });
      act(() => {
        fireEvent.click(screen.getByText('select cp-1'));
      });
      expect(screen.getByText('First Checkpoint')).toBeTruthy();
      expect(screen.queryByText('Select a checkpoint')).toBeNull();
    });

    it('ignores map clicks on locked checkpoints during the select step', () => {
      renderMapScreen();
      act(() => {
        createdTour.next(); // → step 1
      });
      act(() => {
        createdTour.next(); // → step 2 (pick checkpoint)
      });
      act(() => {
        fireEvent.click(screen.getByText('select cp-2')); // cp-2 is locked, ignored
      });
      expect(screen.queryByText('Second Checkpoint')).toBeNull();
      expect(screen.getByText('Select a checkpoint')).toBeTruthy();
    });

    it('sets body classes correctly across step transitions', () => {
      renderMapScreen();
      act(() => {
        createdTour.next(); // → step 1
      });
      expect(
        document.body.classList.contains('adaptive-tour-step-select')
      ).toBe(false);
      act(() => {
        createdTour.next(); // → step 2 (pick checkpoint)
      });
      expect(
        document.body.classList.contains('adaptive-tour-step-select')
      ).toBe(true);
      act(() => {
        fireEvent.click(screen.getByText('select cp-1')); // → step 3 (sidebar)
      });
      expect(
        document.body.classList.contains('adaptive-tour-step-select')
      ).toBe(false);
    });

    it('dismisses the tour when the Start button is clicked', () => {
      renderMapScreen();
      act(() => {
        createdTour.next(); // → step 1
      });
      act(() => {
        createdTour.next(); // → step 2 (pick checkpoint)
      });
      act(() => {
        fireEvent.click(screen.getByText('select cp-1')); // → step 3 (sidebar)
      });
      act(() => {
        fireEvent.click(screen.getByRole('button', {name: 'Start'}));
      });
      expect(createdTour.isActive()).toBe(false);
      expect(localStorage.getItem(SKILL_MAP_TOUR_STORAGE_KEY)).toBe('1');
    });

    it('clears CheckpointCard when the tour is cancelled after checkpoint selection', () => {
      renderMapScreen();
      act(() => {
        createdTour.next(); // → step 1
      });
      act(() => {
        createdTour.next(); // → step 2 (pick checkpoint)
      });
      act(() => {
        fireEvent.click(screen.getByText('select cp-1')); // → step 3 (sidebar)
      });
      expect(screen.getByText('First Checkpoint')).toBeTruthy();
      act(() => {
        createdTour.cancel();
      });
      expect(screen.queryByText('First Checkpoint')).toBeNull();
      expect(screen.getByText('Select a checkpoint')).toBeTruthy();
    });
  });

  describe('with hasSkippedCheckpoints', () => {
    it('does not affect the tour visibility itself', () => {
      renderMapScreen({hasSkippedCheckpoints: true});
      expect(createdTour).not.toBeNull();
      expect(createdTour.isActive()).toBe(true);
    });
  });

  describe('DCDO flag', () => {
    afterEach(() => {
      (DCDO.get as jest.Mock).mockImplementation(
        (_key: string, defaultValue: unknown) => defaultValue
      );
    });

    it('hides the tour when adaptive-skill-map-tour-enabled is false', () => {
      (DCDO.get as jest.Mock).mockReturnValue(false);
      renderMapScreen();
      expect(createdTour).toBeNull();
    });

    it('shows the tour when adaptive-skill-map-tour-enabled is true', () => {
      (DCDO.get as jest.Mock).mockReturnValue(true);
      renderMapScreen();
      expect(createdTour).not.toBeNull();
    });
  });
});

describe('MapScreen resource rail', () => {
  beforeEach(() => {
    setupMockTour();
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("shows the labs' rail beside the map with the theme setting", () => {
    localStorage.setItem(SKILL_MAP_TOUR_STORAGE_KEY, '1');
    renderMapScreen();
    expect(
      screen.getByText('resource rail (sidebar only): settings theme')
    ).toBeTruthy();
  });
});
