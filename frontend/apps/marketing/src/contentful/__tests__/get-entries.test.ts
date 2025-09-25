import {getAllEntriesForContentType} from '../get-entries';

describe('getAllEntriesForContentType', () => {
  it('fetches all entries across multiple pages', async () => {
    const mockClient = {
      getEntries: jest.fn(),
    };
    // First page
    mockClient.getEntries.mockResolvedValueOnce({
      items: [{id: 1}, {id: 2}],
      total: 4,
    });
    // Second page
    mockClient.getEntries.mockResolvedValueOnce({
      items: [{id: 3}, {id: 4}],
      total: 4,
    });

    const result = await getAllEntriesForContentType(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockClient as any,
      'fooType',
    );
    expect(result).toEqual([{id: 1}, {id: 2}, {id: 3}, {id: 4}]);
    expect(mockClient.getEntries).toHaveBeenCalledTimes(2);
    expect(mockClient.getEntries).toHaveBeenCalledWith({
      content_type: 'fooType',
      skip: 0,
      limit: 100,
    });
    expect(mockClient.getEntries).toHaveBeenCalledWith({
      content_type: 'fooType',
      skip: 100,
      limit: 100,
    });
  });

  it('returns all entries if only one page is needed', async () => {
    const mockClient = {
      getEntries: jest.fn().mockResolvedValue({
        items: [{id: 1}, {id: 2}],
        total: 2,
      }),
    };
    const result = await getAllEntriesForContentType(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockClient as any,
      'fooType',
    );
    expect(result).toEqual([{id: 1}, {id: 2}]);
    expect(mockClient.getEntries).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array if there are no entries', async () => {
    const mockClient = {
      getEntries: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
      }),
    };
    const result = await getAllEntriesForContentType(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockClient as any,
      'fooType',
    );
    expect(result).toEqual([]);
    expect(mockClient.getEntries).toHaveBeenCalledTimes(1);
  });
});
