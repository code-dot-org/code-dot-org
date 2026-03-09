import {act, renderHook} from '@testing-library/react-hooks';
import _ from 'lodash';

import {
  PROGRAM_CSD,
  PROGRAM_CSA,
} from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplicationConstants';
import {useRegionalPartner} from '@cdo/apps/code-studio/pd/components/useRegionalPartner';

const GOOD_RESPONSE = {
  id: 1,
  name: 'reginald partner',
  pl_programs_offered: ['CSA'],
};

const mockApiResponse = (status = 200, body = {}) => {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: {'Content-type': 'application/json'},
  });
};

describe('useRegionalPartner tests', () => {
  let fetchStub;
  let debounceStub;

  beforeEach(() => {
    fetchStub = jest.spyOn(window, 'fetch');
    debounceStub = jest.spyOn(_, 'debounce').mockImplementation(f => f);
  });

  afterEach(() => {
    fetchStub.mockRestore();
    debounceStub.mockRestore();
  });

  it('returns undefined when loading', () => {
    fetchStub.mockImplementation(() => new Promise(() => {}));
    const {result} = renderHook(() => useRegionalPartner({}));

    expect(result.current[0]).toBe(undefined);
    expect(result.current[1]).toBe(false);
  });

  it('errors when parameters are bad', async () => {
    const {result} = renderHook(() => useRegionalPartner({}));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual([null, true]);
  });

  it('errors when server errors', async () => {
    fetchStub.mockResolvedValue(mockApiResponse(500, GOOD_RESPONSE));
    const {result, waitFor} = renderHook(() =>
      useRegionalPartner({
        school: '-1',
        schoolZipCode: '12345',
        schoolState: 'AK',
        program: PROGRAM_CSA,
      })
    );
    await waitFor(() => result.current[1] === true);
    expect(result.current).toEqual([null, true]);
  });

  it('returns No Partner if RP does not offer selected program', async () => {
    fetchStub.mockResolvedValue(mockApiResponse(200, GOOD_RESPONSE));
    const {result, waitFor} = renderHook(() =>
      useRegionalPartner({
        school: '-1',
        schoolZipCode: '12345',
        schoolState: 'AK',
        program: PROGRAM_CSD,
      })
    );
    await waitFor(
      () => result.current[0] === null && result.current[1] === false
    );
    expect(result.current).toEqual([null, false]);
    expect(fetchStub).toHaveBeenCalledWith(
      '/api/v1/pd/regional_partner_workshops/find?course=CS+Discoveries&subject=5-day+Summer&zip_code=12345&state=AK'
    );
  });

  it('fetches the regional partner data', async () => {
    fetchStub.mockResolvedValue(mockApiResponse(200, GOOD_RESPONSE));
    const {result, waitFor} = renderHook(() =>
      useRegionalPartner({
        school: '-1',
        schoolZipCode: '12345',
        schoolState: 'AK',
        program: PROGRAM_CSA,
      })
    );
    await waitFor(() => result.current[0] !== undefined);
    expect(result.current).toEqual([GOOD_RESPONSE, false]);
    expect(fetchStub).toHaveBeenCalledWith(
      '/api/v1/pd/regional_partner_workshops/find?course=Computer+Science+A&subject=5-day+Summer&zip_code=12345&state=AK'
    );
  });
});
