import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import ProjectManagerFactory from '@cdo/apps/lab2/projects/ProjectManagerFactory';
import {LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@cdo/apps/lab2/projects/ProjectManagerFactory', () => ({
  __esModule: true,
  default: {
    getProjectManager: jest.fn(),
    getProjectManagerForLevel: jest.fn(),
  },
}));

// Touches the code-studio header DOM; irrelevant here.
jest.mock('@cdo/apps/lab2/hooks/useSources/configureHeader', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockGetProjectManagerForLevel =
  ProjectManagerFactory.getProjectManagerForLevel as jest.Mock;

interface TestSources extends ProjectSources {
  source: string;
  extra?: string;
}

const LEVEL_ONE: LevelProperties = {
  id: 1,
  name: 'Level One',
  appName: 'weblab2',
  isProjectLevel: false,
  usesProjects: true,
};

const LEVEL_TWO: LevelProperties = {...LEVEL_ONE, id: 2, name: 'Level Two'};

const DEFAULT_SOURCES: TestSources = {source: 'default'};
const SAVED_SOURCES: TestSources = {source: 'saved'};

function createFakeProjectManager(
  overrides: {[key: string]: jest.Mock} = {}
): ProjectManager {
  return {
    load: jest
      .fn()
      .mockResolvedValue({sources: SAVED_SOURCES, channel: {isOwner: true}}),
    save: jest.fn(),
    cleanUp: jest.fn().mockResolvedValue(undefined),
    flushSave: jest.fn().mockResolvedValue(undefined),
    getLastChannel: jest.fn().mockReturnValue({isOwner: true}),
    getVersionList: jest.fn().mockResolvedValue([]),
    addSaveStartListener: jest.fn(),
    addSaveSuccessListener: jest.fn(),
    addSaveNoopListener: jest.fn(),
    addSaveFailListener: jest.fn(),
    ...overrides,
  } as unknown as ProjectManager;
}

describe('useSources', () => {
  let store: Store;
  let fakeManager: ProjectManager;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progress: (state: any = {viewAsUserId: null, scriptId: 11}) => state,
    });
    store = getStore();
    jest.clearAllMocks();
    fakeManager = createFakeProjectManager();
    mockGetProjectManagerForLevel.mockResolvedValue(fakeManager);
  });

  afterEach(() => {
    restoreRedux();
  });

  const renderUseSources = (levelProperties: LevelProperties = LEVEL_ONE) => {
    // renderHook passes initialProps to the wrapper too, hence the prop type.
    const wrapper = ({
      children,
    }: {
      children?: React.ReactNode;
      levelProperties?: LevelProperties;
    }) => <Provider store={store}>{children}</Provider>;
    return renderHook(
      (props: {levelProperties: LevelProperties}) =>
        useSources<TestSources>({
          levelProperties: props.levelProperties,
          defaultSources: DEFAULT_SOURCES,
        }),
      {wrapper, initialProps: {levelProperties}}
    );
  };

  // Drain the microtask queue so in-flight loads settle.
  const flush = () => act(async () => {});

  describe('loading', () => {
    it('loads project sources on mount', async () => {
      const {result} = renderUseSources();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.currentSources).toBeUndefined();

      await flush();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentSources).toEqual(SAVED_SOURCES);
      expect(result.current.isEditable).toBe(true);
      expect(result.current.hasEdited).toBe(false);
    });

    it('falls back to defaultSources when the project has none', async () => {
      (fakeManager.load as jest.Mock).mockResolvedValue({sources: undefined});
      const {result} = renderUseSources();
      await flush();

      expect(result.current.currentSources).toEqual(DEFAULT_SOURCES);
    });

    it('does not load when the level does not use projects', async () => {
      const {result} = renderUseSources({...LEVEL_ONE, usesProjects: false});
      await flush();

      expect(mockGetProjectManagerForLevel).not.toHaveBeenCalled();
      expect(result.current.currentSources).toBeUndefined();
    });

    it('surfaces load errors', async () => {
      const error = new Error('load failed');
      (fakeManager.load as jest.Mock).mockRejectedValue(error);
      const {result} = renderUseSources();
      await flush();

      expect(result.current.loadError).toBe(error);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('updateSources', () => {
    it('updates state and saves', async () => {
      const {result} = renderUseSources();
      await flush();

      act(() => result.current.updateSources({source: 'edited'}));

      expect(result.current.currentSources).toEqual({source: 'edited'});
      expect(result.current.hasEdited).toBe(true);
      expect(fakeManager.save).toHaveBeenCalledWith({source: 'edited'}, false);
    });

    it('is a no-op for deep-equal sources', async () => {
      const {result} = renderUseSources();
      await flush();

      act(() => result.current.updateSources({...SAVED_SOURCES}));

      expect(result.current.hasEdited).toBe(false);
      expect(fakeManager.save).not.toHaveBeenCalled();
    });

    it('resolves updaters against the latest sources, not stale state', async () => {
      const {result} = renderUseSources();
      await flush();

      // Two partial updates before any re-render: the second must see the
      // first's write, or it would silently revert it.
      act(() => {
        result.current.updateSources(prev => ({...prev, source: 'edited'}));
        result.current.updateSources(
          prev => ({...prev, extra: 'kept'} as TestSources)
        );
      });

      expect(result.current.currentSources).toEqual({
        source: 'edited',
        extra: 'kept',
      });
    });

    it('ignores updates when the viewer is not the project owner', async () => {
      (fakeManager.getLastChannel as jest.Mock).mockReturnValue({
        isOwner: false,
      });
      const {result} = renderUseSources();
      await flush();

      expect(result.current.isEditable).toBe(false);
      act(() => result.current.updateSources({source: 'edited'}));

      expect(result.current.currentSources).toEqual(SAVED_SOURCES);
      expect(fakeManager.save).not.toHaveBeenCalled();
    });
  });

  describe('patchSources', () => {
    it('shallow-merges patches into the latest sources', async () => {
      const {result} = renderUseSources();
      await flush();

      act(() => {
        result.current.patchSources({extra: 'added'});
        result.current.patchSources({source: 'edited'});
      });

      expect(result.current.currentSources).toEqual({
        source: 'edited',
        extra: 'added',
      });
      expect(fakeManager.save).toHaveBeenLastCalledWith(
        {source: 'edited', extra: 'added'},
        false
      );
    });
  });

  describe('lifecycle', () => {
    it('a superseded load cannot resurrect its sources', async () => {
      // Level one's load hangs until we resolve it by hand.
      let resolveLevelOneLoad = (value: unknown) => value;
      const levelOneManager = createFakeProjectManager({
        load: jest.fn(
          () => new Promise(resolve => (resolveLevelOneLoad = resolve))
        ),
      });
      const levelTwoManager = createFakeProjectManager({
        load: jest.fn().mockResolvedValue({
          sources: {source: 'level two'},
          channel: {isOwner: true},
        }),
      });
      mockGetProjectManagerForLevel
        .mockResolvedValueOnce(levelOneManager)
        .mockResolvedValueOnce(levelTwoManager);

      const {result, rerender} = renderUseSources();
      await flush(); // level one: manager created, load in flight

      rerender({levelProperties: LEVEL_TWO});
      await flush(); // level two loads to completion
      expect(result.current.currentSources).toEqual({source: 'level two'});

      // The stale load resolving late must not clobber level two.
      await act(async () => {
        resolveLevelOneLoad({sources: {source: 'level one'}});
      });
      expect(result.current.currentSources).toEqual({source: 'level two'});
    });

    it('cleans up the previous manager when the level changes', async () => {
      const {rerender} = renderUseSources();
      await flush();

      const levelTwoManager = createFakeProjectManager();
      mockGetProjectManagerForLevel.mockResolvedValue(levelTwoManager);
      rerender({levelProperties: LEVEL_TWO});
      await flush();

      expect(fakeManager.cleanUp).toHaveBeenCalled();
    });

    it('resets hasEdited when a new level loads', async () => {
      const {result, rerender} = renderUseSources();
      await flush();
      act(() => result.current.updateSources({source: 'edited'}));
      expect(result.current.hasEdited).toBe(true);

      rerender({levelProperties: LEVEL_TWO});
      await flush();

      expect(result.current.hasEdited).toBe(false);
    });

    it('flushes pending saves on unmount', async () => {
      const {unmount} = renderUseSources();
      await flush();

      unmount();

      expect(fakeManager.cleanUp).toHaveBeenCalled();
    });
  });

  describe('startOver', () => {
    it('resets to start sources and force-saves', async () => {
      const startSources = {source: 'start'};
      const {result} = renderUseSources({...LEVEL_ONE, startSources});
      await flush();

      act(() => result.current.startOver());

      expect(result.current.currentSources).toEqual(startSources);
      expect(fakeManager.save).toHaveBeenCalledWith(startSources, true);
      expect(result.current.hasEdited).toBe(false);
    });
  });
});
