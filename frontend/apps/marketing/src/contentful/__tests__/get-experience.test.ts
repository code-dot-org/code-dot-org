import {fetchBySlug} from '@contentful/experiences-sdk-react';
import {draftMode} from 'next/headers';

import {getContentfulClient} from '../client';
import {getExperience} from '../get-experience';

jest.mock('react', () => {
  const testCache = <T extends (...args: Array<unknown>) => unknown>(func: T) =>
    func;
  const originalModule = jest.requireActual('react');
  return {
    ...originalModule,
    cache: testCache,
  };
});

jest.mock('@contentful/experiences-sdk-react', () => ({
  fetchBySlug: jest.fn(),
}));
jest.mock('next/headers', () => ({
  draftMode: jest.fn(),
}));
jest.mock('../client', () => ({
  getContentfulClient: jest.fn(),
}));

describe('getExperience', () => {
  const mockSlug = 'test-slug';
  const mockLocaleCode = 'en-US';
  const mockExperience = {id: '123', title: 'Test Experience'};
  const mockError = new Error('Test error');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined experience and error if client is not available', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    (getContentfulClient as jest.Mock).mockReturnValue(undefined);

    const result = await getExperience(mockSlug, mockLocaleCode);

    expect(result).toEqual({experience: undefined, error: undefined});
  });

  it('should return undefined experience and error in editor mode', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    (getContentfulClient as jest.Mock).mockReturnValue({});

    const result = await getExperience(mockSlug, mockLocaleCode, true);

    expect(result).toEqual({experience: undefined, error: undefined});
  });

  it('should fetch experience successfully', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (fetchBySlug as jest.Mock).mockResolvedValue(mockExperience);

    const result = await getExperience(mockSlug, mockLocaleCode);

    expect(fetchBySlug).toHaveBeenCalledWith({
      client: {},
      slug: `/${mockSlug}`,
      experienceTypeId: process.env.CONTENTFUL_EXPERIENCE_CONTENT_TYPE_ID!,
      localeCode: mockLocaleCode,
    });
    expect(result).toEqual({experience: mockExperience, error: undefined});
  });

  it('should return error if fetchBySlug fails', async () => {
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    (getContentfulClient as jest.Mock).mockReturnValue({});
    (fetchBySlug as jest.Mock).mockRejectedValue(mockError);

    const result = await getExperience(mockSlug, mockLocaleCode);

    expect(fetchBySlug).toHaveBeenCalledWith({
      client: {},
      slug: `/${mockSlug}`,
      experienceTypeId: process.env.CONTENTFUL_EXPERIENCE_CONTENT_TYPE_ID!,
      localeCode: mockLocaleCode,
    });
    expect(result).toEqual({experience: undefined, error: mockError});
  });
});
