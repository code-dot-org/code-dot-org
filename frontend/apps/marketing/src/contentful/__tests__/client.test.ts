import {createClient} from 'contentful';

import {_private} from '@/contentful/client';

const DEFAULT_PROPS = {
  space: 'space',
  environment: 'test',
  host: 'test-host',
  accessToken: 'token',
};

jest.mock('contentful', () => ({
  createClient: jest.fn().mockReturnValue('client'),
}));

describe('Contentful Client Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a client if all necessary props are provided', () => {
    const result = _private.getContentfulClient(DEFAULT_PROPS);

    expect(createClient).toHaveBeenCalledWith(DEFAULT_PROPS);
    expect(result).not.toBe(undefined);
  });

  it('should return undefined if not all necessary props are provided', () => {
    const props = {
      ...DEFAULT_PROPS,
      token: undefined,
    };

    const result = _private.getContentfulClient(props);

    expect(createClient).not.toHaveBeenCalledWith(props);
    expect(result).toBe(undefined);
  });
});
