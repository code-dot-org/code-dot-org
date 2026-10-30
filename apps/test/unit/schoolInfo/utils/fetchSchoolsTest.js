import {fetchSchools} from '@cdo/apps/schoolInfo/utils/fetchSchools';
import {SCHOOL_ZIP_SEARCH_URL} from '@cdo/apps/signUpFlow/signUpFlowConstants';

window.fetch = jest.fn();

describe('fetchSchools', () => {
  const zip = '12345';
  const searchUrl = `${SCHOOL_ZIP_SEARCH_URL}${zip}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch schools and return data', async () => {
    const mockData = [
      {nces_id: 1, name: 'Test School 1'},
      {nces_id: 2, name: 'Test School 2'},
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockData),
    });

    const result = await fetchSchools(zip);

    expect(fetch).toHaveBeenCalledWith(searchUrl, {
      headers: {'X-Requested-With': 'XMLHttpRequest'},
    });
    expect(result).toEqual(mockData);
  });

  it('should throw an error when the fetch response is not OK', async () => {
    fetch.mockResolvedValueOnce({ok: false});

    const result = await expect(fetchSchools(zip)).rejects.toThrow(
      'Zip code search for schools failed'
    );
    expect(result).toBeUndefined();
  });
});
