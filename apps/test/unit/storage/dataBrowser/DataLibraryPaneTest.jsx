import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import DataLibraryPane from '@cdo/apps/storage/dataBrowser/DataLibraryPane';

jest.mock('@cdo/apps/storage/dataBrowser/LibraryCategory', () => ({
  __esModule: true,
  default: ({datasets}) => <div>{datasets.join()}</div>,
}));
jest.mock('@cdo/apps/storage/dataBrowser/PreviewModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@cdo/apps/templates/SafeMarkdown', () => ({
  __esModule: true,
  default: () => null,
}));

describe('DataLibraryPane', () => {
  const libraryManifest = {
    categories: [{name: 'Animals', published: true, datasets: ['Cats']}],
    tables: [{name: 'Cats', description: 'Pet cats'}],
  };

  const renderPane = () =>
    render(
      <Provider store={createStore(() => ({data: {libraryManifest}}))}>
        <DataLibraryPane />
      </Provider>
    );

  const search = value =>
    fireEvent.change(screen.getByRole('textbox'), {target: {value}});

  it('treats regular expression characters in the search as literal text', () => {
    renderPane();
    expect(() => search('(')).not.toThrow();
    expect(screen.queryByText('Cats')).not.toBeInTheDocument();
  });

  it('still finds datasets by the start of a word', () => {
    renderPane();
    search('pet');
    expect(screen.getByText('Cats')).toBeInTheDocument();
  });
});
