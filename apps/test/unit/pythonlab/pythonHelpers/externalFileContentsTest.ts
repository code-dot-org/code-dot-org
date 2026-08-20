import fetchMock from 'jest-fetch-mock';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {loadExternalFileContents} from '@cdo/apps/pythonlab/pythonHelpers/externalFileContents';

const mockLogError = jest.fn();

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  getInstance: () => ({
    getMetricsReporter: () => ({
      logError: mockLogError,
    }),
  }),
}));

// The fetched body arrives as bytes, so a text fixture stands in for image
// data. Compared as plain arrays: jsdom's TextEncoder and the code under test
// build their Uint8Arrays in different realms, which toEqual counts as unequal.
const bytesOf = (text: string) => [...new TextEncoder().encode(text)];
const asBytes = (contents: Uint8Array | undefined) => [...(contents ?? [])];

describe('externalFileContents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
  });

  it('fetches the bytes of a url-backed file, keyed by file id', async () => {
    const source: MultiFileSource = {
      folders: {},
      files: {
        '1': {id: '1', name: 'main.py', contents: 'print(1)', folderId: '0'},
        '2': {
          id: '2',
          name: 'dog.jpeg',
          contents: '',
          folderId: '0',
          url: '/v3/assets/channel-id/uuid-1.jpeg',
        },
      },
    };
    fetchMock.mockResponse('dog bytes');

    const contents = await loadExternalFileContents(source);

    expect(fetchMock).toHaveBeenCalledWith('/v3/assets/channel-id/uuid-1.jpeg');
    expect(asBytes(contents['2'])).toEqual(bytesOf('dog bytes'));
    // A file that carries its own contents is not fetched.
    expect(contents['1']).toBeUndefined();
  });

  it('reuses the bytes of a url it has already fetched', async () => {
    const source: MultiFileSource = {
      folders: {},
      files: {
        '1': {
          id: '1',
          name: 'cat.png',
          contents: '',
          folderId: '0',
          url: '/v3/assets/channel-id/uuid-2.png',
        },
      },
    };
    fetchMock.mockResponse('cat bytes');

    await loadExternalFileContents(source);
    const contents = await loadExternalFileContents(source);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(asBytes(contents['1'])).toEqual(bytesOf('cat bytes'));
  });

  it('logs an error and omits a file whose fetch fails', async () => {
    const source: MultiFileSource = {
      folders: {},
      files: {
        '1': {
          id: '1',
          name: 'missing.png',
          contents: '',
          folderId: '0',
          url: '/v3/assets/channel-id/uuid-3.png',
        },
      },
    };
    fetchMock.mockResponse('', {status: 404});

    const contents = await loadExternalFileContents(source);

    expect(contents).toEqual({});
    expect(mockLogError).toHaveBeenCalledWith(
      'Failed to load Python Lab project file',
      expect.any(Error),
      {fileName: 'missing.png'}
    );
  });
});
