import axios, {AxiosHeaders} from 'axios';

import {getContentfulClientProps} from '../createClient';

jest.mock('contentful', () => ({
  createClient: jest.fn(() => ({mocked: true})),
}));

describe('adapter config', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalGetAdapter: any;
  let fetchAdapterMock: jest.Mock;

  beforeAll(() => {
    originalGetAdapter = axios.getAdapter;
    fetchAdapterMock = jest.fn();
    jest.spyOn(axios, 'getAdapter').mockImplementation((...args: unknown[]) => {
      if (args[0] === 'fetch') return fetchAdapterMock;
      return originalGetAdapter(...args);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('adds sys.id[in] and content_type as tags in fetchOptions.next.tags', () => {
    process.env.CONTENTFUL_SPACE_ID = 'space';
    process.env.CONTENTFUL_ENV_ID = 'env';
    process.env.CONTENTFUL_PREVIEW_TOKEN = 'preview-token';
    process.env.CONTENTFUL_DELIVERY_TOKEN = 'delivery-token';
    const {adapter} = getContentfulClientProps('delivery');
    expect(adapter).toBeDefined();
    const config = {
      params: {'sys.id[in]': 'id1,id2', content_type: 'fooType'},
      fetchOptions: {},
      headers: new AxiosHeaders(),
    };
    fetchAdapterMock.mockReturnValue('fetch-result');
    const result = adapter!(config);
    expect(fetchAdapterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchOptions: expect.objectContaining({
          cache: 'force-cache',
          next: expect.objectContaining({
            revalidate: 900,
            tags: expect.arrayContaining(['id1', 'id2', 'fooType']),
          }),
        }),
      }),
    );
    expect(result).toBe('fetch-result');
  });

  it('handles missing sys.id[in] and content_type gracefully', () => {
    process.env.CONTENTFUL_SPACE_ID = 'space';
    process.env.CONTENTFUL_ENV_ID = 'env';
    process.env.CONTENTFUL_PREVIEW_TOKEN = 'preview-token';
    process.env.CONTENTFUL_DELIVERY_TOKEN = 'delivery-token';
    const {adapter} = getContentfulClientProps('delivery');
    expect(adapter).toBeDefined();
    const config = {
      params: {},
      fetchOptions: {},
      headers: new AxiosHeaders(), // use correct type
    };
    fetchAdapterMock.mockReturnValue('fetch-result');
    const result = adapter!(config);
    expect(fetchAdapterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchOptions: expect.objectContaining({
          cache: 'force-cache',
          next: expect.objectContaining({
            revalidate: 900,
            tags: [],
          }),
        }),
      }),
    );
    expect(result).toBe('fetch-result');
  });
});
