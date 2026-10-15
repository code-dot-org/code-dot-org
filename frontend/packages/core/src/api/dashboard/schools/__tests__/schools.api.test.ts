import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createSchoolsApi} from '../schools.api';

function fakeTransport(result: unknown = undefined) {
  const request = vi.fn().mockResolvedValue(result);
  const transport = {request} as unknown as Transport;
  return {api: createSchoolsApi(transport), request};
}

describe('createSchoolsApi.zipSearch', () => {
  it('GETs the zip search route as an XHR and camelCases the results', async () => {
    const {api, request} = fakeTransport([
      {nces_id: '12345678', name: 'Example High School'},
    ]);

    const schools = await api.zipSearch({zip: '98101'});

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/dashboardapi/v1/schoolzipsearch/98101',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      }),
    );
    expect(schools).toEqual([
      {ncesId: '12345678', name: 'Example High School'},
    ]);
  });

  it('resolves to an empty list when the zip matches no schools', async () => {
    const {api} = fakeTransport([]);
    await expect(api.zipSearch({zip: '00000'})).resolves.toEqual([]);
  });

  it('rejects when the body fails schema validation', async () => {
    const {api} = fakeTransport([
      {nces_id: 12345678, name: 'Example High School'},
    ]);
    await expect(api.zipSearch({zip: '98101'})).rejects.toThrow();
  });
});
