import {renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import {CodebridgeLevelProperties} from '@cdo/apps/codebridge';
import {useSource} from '@cdo/apps/codebridge/hooks/useSource';
import lab, {setChannel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {Channel, ProjectSources} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {
  nonValidatedLevelProperties,
  smallProject,
  templateBackedLevelProperties,
} from '../test-files';
import {mockAppOptions} from '../test_utils';

const defaultSources = {
  source: smallProject,
};

const ownedChannel: Channel = {
  id: '1',
  name: '1',
  isOwner: true,
  projectType: 'pythonlab',
  publishedAt: null,
  createdAt: '',
  updatedAt: '',
};

describe('useSource', () => {
  let store: Store;
  let mockedProjectManager: jest.Mocked<ProjectManager>;
  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab,
      lab2Project,
      lab2System,
      progress,
    });
    store = getStore();
    mockedProjectManager = {
      save: jest.fn(),
      setLastSource: jest.fn(),
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);
    // Set up the channel so we are not in read only mode (isOwner = true)
    store.dispatch(setChannel(ownedChannel));
  });

  afterEach(() => {
    restoreRedux();
    jest.resetAllMocks();
  });

  function renderDefault(levelProperties?: CodebridgeLevelProperties) {
    const wrapper = ({children}: {children?: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );
    const {result} = renderHook(
      () =>
        useSource(
          defaultSources,
          levelProperties || nonValidatedLevelProperties,
          undefined
        ),
      {
        wrapper,
      }
    );
    return result.current;
  }

  it('returns level start sources in start mode', () => {
    mockAppOptions({editBlocks: 'start_sources'});
    const {startSources} = renderDefault(templateBackedLevelProperties);
    const expectedStartSources = {
      source: templateBackedLevelProperties.startSources,
      labConfig: undefined,
    };
    expect(startSources).toEqual(expectedStartSources);
  });

  it('returns template start sources in standard mode', () => {
    const {startSources} = renderDefault(templateBackedLevelProperties);
    const expectedStartSources = {
      source: templateBackedLevelProperties.templateSources,
      labConfig: undefined,
    };
    expect(startSources).toEqual(expectedStartSources);
  });

  it('updates source on level change', () => {
    store.dispatch(setChannel(ownedChannel));
    renderDefault(templateBackedLevelProperties);
    expect(mockedProjectManager.save).toHaveBeenCalledTimes(1);
    expect(mockedProjectManager.setLastSource).toHaveBeenCalledTimes(1);
    renderDefault(nonValidatedLevelProperties);
    expect(mockedProjectManager.save).toHaveBeenCalledTimes(2);
    expect(mockedProjectManager.setLastSource).toHaveBeenCalledTimes(2);
    const expectedNewSources = {
      source: nonValidatedLevelProperties.startSources,
      labConfig: undefined,
    };
    expect(mockedProjectManager.save).toHaveBeenLastCalledWith(
      expectedNewSources,
      false,
      false
    );
  });

  it('does not reset when initial sources change by reference but not value', () => {
    const wrapper = ({children}: {children?: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );
    let currentInitialSources: ProjectSources = {source: smallProject};
    const {rerender} = renderHook(
      () =>
        useSource(
          defaultSources,
          nonValidatedLevelProperties,
          currentInitialSources
        ),
      {wrapper}
    );
    // The mount performs the one legitimate reset to the loaded server source.
    expect(mockedProjectManager.save).toHaveBeenCalledTimes(1);
    expect(mockedProjectManager.setLastSource).toHaveBeenCalledTimes(1);

    // A deep-equal but referentially-new object — as Java Lab produces whenever
    // a save echoes a fresh channel/labConfig — must not trigger another reset,
    // which would clobber the user's live edits with the stale server source.
    currentInitialSources = {source: {...smallProject}};
    rerender();
    expect(mockedProjectManager.save).toHaveBeenCalledTimes(1);
    expect(mockedProjectManager.setLastSource).toHaveBeenCalledTimes(1);
  });
});
