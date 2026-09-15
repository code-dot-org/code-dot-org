import {expect} from 'chai'; // eslint-disable-line no-restricted-imports

import {fetchShareFailure} from '@cdo/apps/lab2/projects/channelsApi';
import HttpClient from '@cdo/apps/util/HttpClient';

describe('channelsApi fetchShareFailure', () => {
  let fetchJsonSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchJsonSpy = jest.spyOn(HttpClient, 'fetchJson');
  });

  afterEach(() => {
    fetchJsonSpy.mockRestore();
  });

  it('returns the English failure for English users', async () => {
    fetchJsonSpy.mockResolvedValue({
      value: {
        share_failure: {type: 'profanity', content: 'darn'},
        intl_share_failure: null,
        language: 'en',
      },
    });

    const result = await fetchShareFailure('abc123');

    expect(result).to.deep.equal({type: 'profanity', content: 'darn'});
    expect(fetchJsonSpy.mock.calls[0][0]).to.equal(
      '/v3/channels/abc123/share-failure'
    );
  });

  it("returns the user's-language failure for non-English users", async () => {
    fetchJsonSpy.mockResolvedValue({
      value: {
        share_failure: false,
        intl_share_failure: {type: 'profanity', content: 'zut'},
        language: 'fr',
      },
    });

    const result = await fetchShareFailure('abc123');

    expect(result).to.deep.equal({type: 'profanity', content: 'zut'});
  });

  it('ignores an English-only failure for non-English users', async () => {
    // Matches how legacy labs block: only the check in the user's own
    // language counts.
    fetchJsonSpy.mockResolvedValue({
      value: {
        share_failure: {type: 'profanity', content: 'darn'},
        intl_share_failure: false,
        language: 'fr',
      },
    });

    const result = await fetchShareFailure('abc123');

    expect(result).to.be.null;
  });

  it('returns null when the project is clean', async () => {
    fetchJsonSpy.mockResolvedValue({
      value: {
        share_failure: false,
        intl_share_failure: null,
        language: 'en',
      },
    });

    const result = await fetchShareFailure('abc123');

    expect(result).to.be.null;
  });
});
