import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import {useSource} from '@cdo/apps/codebridge/hooks/useSource';
import lab, {setChannel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {smallProjectSources} from '../test-files';

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
  });

  afterEach(() => {
    restoreRedux();
    jest.resetAllMocks();
  });

  function renderDefault() {
    const wrapper = ({children}: {children?: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );
    const {result} = renderHook(() => useSource(smallProjectSources), {
      wrapper,
    });
    return result.current;
  }

  it('set project saves to project manager in standard mode', () => {
    store.dispatch(
      setChannel({
        id: '1',
        name: '1',
        isOwner: true,
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
    expect(mockedProjectManager.save).toHaveBeenCalled();
  });
});
