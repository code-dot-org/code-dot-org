import {expect} from 'chai'; // eslint-disable-line no-restricted-imports

import {getPredictResponse} from '@cdo/apps/lab2/projects/userLevelsApi';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

describe('userLevelsApi getPredictResponse', () => {
  let fetchJsonSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchJsonSpy = jest.spyOn(HttpClient, 'fetchJson');
  });

  afterEach(() => {
    fetchJsonSpy.mockRestore();
  });

  it('requests the current user without a user segment', async () => {
    fetchJsonSpy.mockResolvedValue({value: {data: 'my response'}});

    const result = await getPredictResponse(42, 7);

    expect(result).to.equal('my response');
    expect(fetchJsonSpy.mock.calls[0][0]).to.equal(
      '/user_levels/level_source/7/42'
    );
  });

  it("appends /user/:userId when viewing a student's response", async () => {
    fetchJsonSpy.mockResolvedValue({value: {data: 'student response'}});

    const result = await getPredictResponse(42, 7, 99);

    expect(result).to.equal('student response');
    expect(fetchJsonSpy.mock.calls[0][0]).to.equal(
      '/user_levels/level_source/7/42/user/99'
    );
  });

  it('returns null on a network error', async () => {
    fetchJsonSpy.mockRejectedValue(new NetworkError('boom', {} as Response));

    const result = await getPredictResponse(42, 7, 99);

    expect(result).to.be.null;
  });
});
