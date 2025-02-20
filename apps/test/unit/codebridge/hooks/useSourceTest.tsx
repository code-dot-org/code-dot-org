import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import {useSource} from '@cdo/apps/codebridge/hooks/useSource';
import lab, {onLevelChange, setChannel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {Channel} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {
  nonValidatedLevelProperties,
  smallProject,
  smallProjectSources,
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
  let projectSaveSpy: jest.Mock;
  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab,
      lab2Project,
      lab2System,
      progress,
    });
    store = getStore();
    projectSaveSpy = jest.fn();
    mockedProjectManager = {
      save: projectSaveSpy,
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);
    // Set up the channel so we are not in read only mode (isOwner = true)
    store.dispatch(setChannel(ownedChannel));
  });

  afterEach(() => {
    restoreRedux();
    jest.resetAllMocks();
  });

  function renderDefault() {
    const wrapper = ({children}: {children?: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );
    const {result} = renderHook(() => useSource(defaultSources), {
      wrapper,
    });
    return result.current;
  }

  it('set project saves to project manager in standard mode', () => {
    const {setProject} = renderDefault();
    act(() => {
      setProject(smallProjectSources);
    });
    expect(mockedProjectManager.save).toHaveBeenCalled();
  });

  it('does not save to project manager in readonly mode', () => {
    store.dispatch(
      setChannel({
        id: '1',
        name: '1',
        // If the user is not the owner, we are in readonly mode.
        isOwner: false,
        projectType: 'pythonlab',
        publishedAt: null,
        createdAt: '',
        updatedAt: '',
      })
    );
    const {setProject} = renderDefault();
    act(() => {
      setProject(smallProjectSources);
    });
    expect(mockedProjectManager.save).toHaveBeenCalledTimes(0);
  });

  it('sets project as edited on first edit', () => {
    expect(store.getState().lab2Project.hasEdited).toBe(false);
    const {setProject} = renderDefault();
    act(() => {
      setProject(smallProjectSources);
    });
    expect(store.getState().lab2Project.hasEdited).toBe(true);
  });

  it('returns level start sources in start mode', () => {
    mockAppOptions({editBlocks: 'start_sources'});
    store.dispatch(
      onLevelChange({levelProperties: templateBackedLevelProperties})
    );
    const {startSources} = renderDefault();
    const expectedStartSources = {
      source: templateBackedLevelProperties.startSources,
      labConfig: undefined,
    };
    expect(startSources).toEqual(expectedStartSources);
  });

  it('returns template start sources in standard mode', () => {
    store.dispatch(
      onLevelChange({levelProperties: templateBackedLevelProperties})
    );
    const {startSources} = renderDefault();
    const expectedStartSources = {
      source: templateBackedLevelProperties.templateSources,
      labConfig: undefined,
    };
    expect(startSources).toEqual(expectedStartSources);
  });

  it('updates source on level change', () => {
    store.dispatch(
      onLevelChange({
        levelProperties: templateBackedLevelProperties,
        channel: ownedChannel,
      })
    );
    renderDefault();
    expect(mockedProjectManager.save).toHaveBeenCalledTimes(1);
    act(() => {
      store.dispatch(
        onLevelChange({
          levelProperties: nonValidatedLevelProperties,
          channel: ownedChannel,
        })
      );
    });
    expect(mockedProjectManager.save).toHaveBeenCalledTimes(2);
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
});
