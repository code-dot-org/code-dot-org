import {FileTabs} from '@codebridge/FileTabs/FileTabs';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  CodebridgeContextProvider,
  CodebridgeContextType,
} from '@cdo/apps/codebridge';

import {getDefaultCodebridgeContext} from '../test_utils';
import '@testing-library/jest-dom';

const context: CodebridgeContextType = {
  ...getDefaultCodebridgeContext(),
  source: {
    files: {
      '1': {
        id: '1',
        name: 'file1.py',
        active: false,
        open: true,
        language: 'py',
        contents: '',
        folderId: '0',
      },
      '2': {
        id: '2',
        name: 'file2.py',
        active: true,
        open: true,
        language: 'py',
        contents: '',
        folderId: '0',
      },
    },
    folders: {},
  },
  setActiveFile: jest.fn(),
  closeFile: jest.fn(),
};

describe('FileTabs', () => {
  function renderDefault() {
    render(
      <CodebridgeContextProvider value={context}>
        <FileTabs />
      </CodebridgeContextProvider>
    );
  }

  // Timeout increased to 10 seconds for these tests because sometimes
  // userEvent seems to take a while on drone/staging.
  it('activates an inactive tab on click', async () => {
    renderDefault();
    const file = context.source.files['1'];
    const tab = screen.getByText(file.name);
    const user = userEvent.setup();
    await user.click(tab);
    expect(context.setActiveFile).toHaveBeenCalledWith(file.id);
  }, 10000);

  it('can close a tab', async () => {
    renderDefault();
    const closeButton = screen.getByRole('button', {
      name: 'close file file1.py',
    });
    const user = userEvent.setup();
    await user.click(closeButton);
    expect(context.closeFile).toHaveBeenCalledWith('1');
  }, 15000);
});
