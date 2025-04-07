import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {getRelativeImageUrl, getAbsoluteImageUrl} from '../getImage';

describe('getRelativeImageUrl', () => {
  it('should return undefined if asset is undefined', () => {
    expect(getRelativeImageUrl(undefined)).toBeUndefined();
  });

  it('should return the relative URL if asset has a file URL', () => {
    const asset = {
      fields: {
        file: {
          url: '/images/example.jpg',
        },
      },
    } as ExperienceAsset;
    expect(getRelativeImageUrl(asset)).toBe('/images/example.jpg');
  });

  it('should return undefined if asset does not have a file URL', () => {
    const asset = {
      fields: {
        file: undefined,
      },
    } as ExperienceAsset;
    expect(getRelativeImageUrl(asset)).toBeUndefined();
  });
});

describe('getAbsoluteImageUrl', () => {
  it('should return undefined if asset is undefined', () => {
    expect(getAbsoluteImageUrl(undefined)).toBeUndefined();
  });

  it('should return the absolute URL if asset has a file URL', () => {
    const asset = {
      fields: {
        file: {
          url: '//assets.code.org/images/example.jpg',
        },
      },
    } as ExperienceAsset;
    expect(getAbsoluteImageUrl(asset)).toBe(
      'https://assets.code.org/images/example.jpg',
    );
  });

  it('should return undefined if asset does not have a file URL', () => {
    const asset = {
      fields: {
        file: undefined,
      },
    } as ExperienceAsset;
    expect(getAbsoluteImageUrl(asset)).toBeUndefined();
  });
});
