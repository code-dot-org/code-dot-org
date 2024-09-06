import {SCHOOL_ZIP_SEARCH_URL} from '@cdo/apps/schoolInfo/constants';
import {fetchSchools} from '@cdo/apps/schoolInfo/utils/fetchSchools';

window.fetch = jest.fn();

describe('fetchSchools', () => {
  const mockCallback = jest.fn();
  const zip = '12345';
  const searchUrl = `${SCHOOL_ZIP_SEARCH_URL}${zip}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch schools and invoke the callback with data', async () => {
    const mockData = [
      {nces_id: 1, name: 'Test School 1'},
      {nces_id: 2, name: 'Test School 2'},
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockData),
    });

    await fetchSchools(zip, mockCallback);

    expect(fetch).toHaveBeenCalledWith(searchUrl, {
      headers: {'X-Requested-With': 'XMLHttpRequest'},
    });
    expect(mockCallback).toHaveBeenCalledWith(mockData);
  });

  it('should throw an error when the fetch response is not OK', async () => {
    fetch.mockResolvedValueOnce({ok: false});

    await expect(fetchSchools(zip, mockCallback)).rejects.toThrow(
      'Zip code search for schools failed'
    );

    expect(fetch).toHaveBeenCalledWith(searchUrl, {
      headers: {'X-Requested-With': 'XMLHttpRequest'},
    });
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
