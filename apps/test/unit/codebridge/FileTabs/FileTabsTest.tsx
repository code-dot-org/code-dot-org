import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {
  CodebridgeContextProvider,
  CodebridgeContextType,
} from '@cdo/apps/codebridge';
import {FileTabs} from '@cdo/apps/codebridge/FileTabs';

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
};

describe('FileTabs', () => {
  function renderDefault() {
    render(
      <CodebridgeContextProvider value={context}>
        <FileTabs />
      </CodebridgeContextProvider>
    );
  }

  it('activates an inactive tab on click', async () => {
    renderDefault();
    const defaultOpenFile = context.source.files['2'];
    expect(screen.getByRole('tab', {selected: true})).toHaveTextContent(
      defaultOpenFile.name
    );
    const file = context.source.files['1'];
    const tab = screen.getByRole('tab', {selected: false});
    expect(tab).toHaveTextContent(file.name);
    fireEvent.click(tab);
    expect(context.setActiveFile).toHaveBeenCalledWith(file.id);
  });
});
