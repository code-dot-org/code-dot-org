import {getContentfulClient} from '@/contentful/client';
import {getAllEntriesForContentType} from '@/contentful/get-entries';

import {getContentfulActivities} from '../getContentfulActivities';

jest.mock('@/contentful/client');
jest.mock('@/contentful/get-entries');

describe('getContentfulActivities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns activities when client is available', async () => {
    const mockClient = {};
    const mockActivities = [{id: 1}, {id: 2}];
    (getContentfulClient as jest.Mock).mockReturnValue(mockClient);
    (getAllEntriesForContentType as jest.Mock).mockResolvedValue(
      mockActivities,
    );

    const result = await getContentfulActivities();

    expect(getContentfulClient).toHaveBeenCalled();
    expect(getAllEntriesForContentType).toHaveBeenCalledWith(
      mockClient,
      'curriculum',
    );
    expect(result).toEqual(mockActivities);
  });

  it('returns empty array and warns when client is not available', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);

    const result = await getContentfulActivities();

    expect(getContentfulClient).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      '⚠️ Contentful client is not available. Please check that frontend/apps/marketing/.env is populated.',
    );
    expect(result).toEqual([]);
    warnSpy.mockRestore();
  });
});
