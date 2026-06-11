import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {Codebridge} from '@codebridge/Codebridge';
import {render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import {handleRunClick} from '@cdo/apps/javalab/lab2/javabuilderRunUtils';
import Javalab2View from '@cdo/apps/javalab/lab2/Javalab2View';
import {JavalabLevelProperties} from '@cdo/apps/javalab/lab2/types';
import lab, {setChannel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2Project, {
  setProjectSource,
  setProjectSourceLevelId,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {Channel, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser from '@cdo/apps/templates/currentUserRedux';

jest.mock('@codebridge/Codebridge', () => ({
  Codebridge: jest.fn(() => <div>Codebridge</div>),
}));

jest.mock('@cdo/apps/javalab/lab2/javabuilderRunUtils', () => ({
  handleRunClick: jest.fn(),
  stopJavaCode: jest.fn(),
  sendJavaConsoleInput: jest.fn(),
}));

// useSource normally writes the start code into redux and triggers a throttled
// (no-op) save of its own. Stub it (capturing its args for the starter-asset
// tests) and seed redux directly below.
jest.mock('@codebridge/hooks/useSource', () => ({
  useSource: jest.fn(() => ({startSources: undefined})),
}));

const LEVEL_ID = 5;

const levelProperties: JavalabLevelProperties = {
  id: LEVEL_ID,
  name: '',
  appName: 'javalab',
};

const source: MultiFileSource = {folders: {}, files: {}};
const projectSources: ProjectSources = {source};

const channel: Channel = {
  id: 'test-channel',
  name: '',
  isOwner: true,
  projectType: 'javalab',
  publishedAt: null,
  createdAt: '',
  updatedAt: '',
};

describe('Javalab2View', () => {
  let store: Store;
  let addSaveSuccessListener: jest.Mock;
  let getCurrentVersionId: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    stubRedux();
    registerReducers({progress, lab2Project, lab, lab2System, currentUser});
    store = getStore();

    addSaveSuccessListener = jest.fn();
    getCurrentVersionId = jest.fn().mockReturnValue('test-version-id');
    jest
      .spyOn(Lab2Registry.getInstance(), 'getProjectManager')
      // The view only registers a save-success listener and reads the current
      // version id; a partial mock is enough.
      .mockReturnValue({addSaveSuccessListener, getCurrentVersionId} as never);
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
  });

  function viewElement(
    initialSources: ProjectSources | undefined,
    viewChannel: Channel,
    viewLevelProperties: JavalabLevelProperties = levelProperties
  ) {
    return (
      <Provider store={store}>
        <ThemeProvider>
          <Javalab2View
            levelProperties={viewLevelProperties}
            initialSources={initialSources}
            channel={viewChannel}
          />
        </ThemeProvider>
      </Provider>
    );
  }

  function renderView(initialSources: ProjectSources | undefined) {
    // Seed the loaded code, as useSource would.
    store.dispatch(setChannel(channel));
    store.dispatch(setProjectSource(projectSources));
    store.dispatch(setProjectSourceLevelId(LEVEL_ID));
    return render(viewElement(initialSources, channel));
  }

  // The run flow lives in javabuilderRunUtils (mocked); the view's job is
  // telling it whether the project has server sources yet.
  async function runFromView() {
    const codebridgeProps = (Codebridge as unknown as jest.Mock).mock.calls.at(
      -1
    )[0];
    await codebridgeProps.onRun(
      /* runTests */ false,
      jest.fn(),
      /* source */ undefined
    );
    const handleRunClickArgs = (handleRunClick as jest.Mock).mock.calls.at(-1);
    return {needsInitialSourcesSave: handleRunClickArgs[5]};
  }

  it('requests an initial sources save on run when no server sources exist', async () => {
    renderView(undefined);

    const {needsInitialSourcesSave} = await runFromView();
    expect(needsInitialSourcesSave).toBe(true);
  });

  it('does not request an initial sources save when the project was loaded from the server', async () => {
    renderView(projectSources);

    const {needsInitialSourcesSave} = await runFromView();
    expect(needsInitialSourcesSave).toBe(false);
  });

  it('stops requesting the initial sources save once a save has succeeded', async () => {
    renderView(undefined);

    // Simulate a successful save (e.g. the first run's force-save landing).
    const onSaveSuccess = addSaveSuccessListener.mock.calls[0][0];
    onSaveSuccess();

    const {needsInitialSourcesSave} = await runFromView();
    expect(needsInitialSourcesSave).toBe(false);
  });

  it('still requests the initial sources save when a save success has no version id', async () => {
    renderView(undefined);

    // A save success without a version id means no new version actually
    // landed in S3, so the next run must still force a save.
    getCurrentVersionId.mockReturnValue(undefined);
    const onSaveSuccess = addSaveSuccessListener.mock.calls[0][0];
    onSaveSuccess();

    const {needsInitialSourcesSave} = await runFromView();
    expect(needsInitialSourcesSave).toBe(true);
  });

  it('requests the initial sources save again after a level change', async () => {
    const {rerender} = renderView(undefined);
    addSaveSuccessListener.mock.calls[0][0]();

    // A new level brings a new channel (and ProjectManager).
    rerender(viewElement(undefined, {...channel, id: 'next-level-channel'}));

    const {needsInitialSourcesSave} = await runFromView();
    expect(needsInitialSourcesSave).toBe(true);
  });

  describe('starter assets', () => {
    // Legacy levels store starter assets only as the level's
    // {friendlyName => uuidName} mapping; the view merges them into the
    // sources it hands to codebridge/useSource.
    const assetLevelProperties: JavalabLevelProperties = {
      ...levelProperties,
      name: 'Asset Level',
      startSources: {
        'Main.java': {text: 'class Main {}', isVisible: true},
        // The shared LevelProperties contract types startSources as
        // MultiFileSource | ProjectSources; javalab sends the flat shape.
      } as unknown as JavalabLevelProperties['startSources'],
      starterAssets: {'cat.png': 'uuid-1.png'},
    };

    function renderWithAssets(initialSources: ProjectSources | undefined) {
      store.dispatch(setChannel(channel));
      store.dispatch(setProjectSource(projectSources));
      store.dispatch(setProjectSourceLevelId(LEVEL_ID));
      return render(viewElement(initialSources, channel, assetLevelProperties));
    }

    function lastUseSourceArgs() {
      const {useSource} = jest.requireMock('@codebridge/hooks/useSource');
      return (useSource as jest.Mock).mock.calls.at(-1);
    }

    it('merges mapping entries into startSources as locked url-backed files', () => {
      renderWithAssets(undefined);
      const codebridgeProps = (
        Codebridge as unknown as jest.Mock
      ).mock.calls.at(-1)[0];
      const startSources = codebridgeProps.levelProperties
        .startSources as MultiFileSource;
      const image = Object.values(startSources.files).find(
        f => f.name === 'cat.png'
      )!;
      expect(image.url).toBe(
        '/level_starter_assets/Asset%20Level/uuid/uuid-1.png'
      );
      expect(image.type).toBe('locked_starter');
    });

    it('merges mapping entries into url-free initial sources from the server', () => {
      const loaded: ProjectSources = {
        source: {
          folders: {},
          files: {
            '0': {
              id: '0',
              name: 'Main.java',
              contents: 'class Main {}',
              folderId: '0',
            },
          },
          openFiles: ['0'],
        },
      };
      renderWithAssets(loaded);
      const mergedInitialSources = lastUseSourceArgs()[2] as ProjectSources;
      const files = Object.values(
        (mergedInitialSources.source as MultiFileSource).files
      );
      const image = files.find(f => f.name === 'cat.png')!;
      expect(image.url).toBe(
        '/level_starter_assets/Asset%20Level/uuid/uuid-1.png'
      );
    });

    it('does not re-append mapping entries when initial sources already have a url file', () => {
      // The ghost-file guard: once the project carries url entries of its
      // own, a deleted starter asset must stay deleted.
      const loaded: ProjectSources = {
        source: {
          folders: {},
          files: {
            '0': {
              id: '0',
              name: 'student.png',
              contents: '',
              folderId: '0',
              url: '/v3/assets/test-channel/uuid-9.png',
            },
          },
          openFiles: [],
        },
      };
      renderWithAssets(loaded);
      const mergedInitialSources = lastUseSourceArgs()[2] as ProjectSources;
      const names = Object.values(
        (mergedInitialSources.source as MultiFileSource).files
      ).map(f => f.name);
      expect(names).toEqual(['student.png']);
    });
  });

  it('ignores a save success from the previous level after a level change', async () => {
    const {rerender} = renderView(undefined);
    rerender(viewElement(undefined, {...channel, id: 'next-level-channel'}));

    // The previous level's save lands late; it must not mark the new level saved.
    const staleOnSaveSuccess = addSaveSuccessListener.mock.calls[0][0];
    staleOnSaveSuccess();

    expect((await runFromView()).needsInitialSourcesSave).toBe(true);

    // A save on the new level's manager does count.
    const onSaveSuccess = addSaveSuccessListener.mock.calls[1][0];
    onSaveSuccess();

    expect((await runFromView()).needsInitialSourcesSave).toBe(false);
  });
});
