import {FileTabs} from '@codebridge/FileTabs/FileTabs';
import {Store} from '@reduxjs/toolkit';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';

import progress, {initProgress} from '@cdo/apps/code-studio/progressRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import lab2Project, {
  setProjectSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import '@testing-library/jest-dom';
import {initProgressPayload} from '../test-files';

const project: ProjectSources = {
  source: {
    files: {
      '1': {
        id: '1',
        name: 'file1.py',
        active: false,
        language: 'py',
        contents: '',
        folderId: '0',
      },
      '2': {
        id: '2',
        name: 'file2.py',
        active: true,
        language: 'py',
        contents: '',
        folderId: '0',
      },
    },
    folders: {},
    openFiles: ['1', '2'],
  },
};

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

describe('FileTabs', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab2Project,
      lab,
      progress,
      lab2System,
    });
    store = getStore();
    store.dispatch(setProjectSource(project));
    store.dispatch(initProgress(initProgressPayload));
  });

  afterEach(() => {
    restoreRedux();
  });
  function renderDefault() {
    render(
      <Provider store={store}>
        <FileTabs />
      </Provider>
    );
  }

  // Timeout increased to 10 seconds for these tests because sometimes
  // userEvent seems to take a while on drone/staging.
  it('activates an inactive tab on click', async () => {
    renderDefault();
    const file = (project.source as MultiFileSource).files['1'];
    const tab = screen.getByText(file.name);
    const user = userEvent.setup();
    await user.click(tab);
    const newSource = store.getState().lab2Project.projectSources
      .source as MultiFileSource;
    expect(newSource.files[file.id].active).toBe(true);
  });

  it('can close a tab', async () => {
    renderDefault();
    const closeButton = screen.getByRole('button', {
      name: 'close file file1.py',
    });
    const user = userEvent.setup();
    await user.click(closeButton);
    // Expect the file to be closed, which means the close button should be gone.
    expect(
      screen.queryByRole('button', {name: 'close file file1.py'})
    ).not.toBeInTheDocument();
  });
});
