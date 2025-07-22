import {isWebKitEngine} from '@/selectors/getBrowser';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {
  getRelativeImageUrl,
  getOptimizedImageFormat,
  getAbsoluteImageUrl,
} from '../getImage';

jest.mock('@/selectors/getBrowser', () => ({
  isWebKitEngine: jest.fn(),
}));

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

describe('getOptimizedImageFormat', () => {
  it('returns undefined for URLs without an extension', () => {
    expect(
      getOptimizedImageFormat('https://test.example/image'),
    ).toBeUndefined();
  });

  it('returns avif for non-gif image extensions', () => {
    expect(getOptimizedImageFormat('https://test.example/image.JPG')).toBe(
      'avif',
    );
    expect(getOptimizedImageFormat('https://test.example/image.png')).toBe(
      'avif',
    );
  });

  it('returns webp for gif images in WebKit browsers', () => {
    (isWebKitEngine as jest.Mock).mockReturnValue(true);
    expect(getOptimizedImageFormat('https://test.example/image.gif')).toBe(
      'webp',
    );
  });

  it('returns avif for gif images in non-WebKit browsers', () => {
    (isWebKitEngine as jest.Mock).mockReturnValue(false);
    expect(getOptimizedImageFormat('https://test.example/image.gif')).toBe(
      'avif',
    );
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
      'https://assets.code.org/images/example.jpg?fm=avif',
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

  it('should return the absolute URL if asset is a string', () => {
    const asset = '//assets.code.org/images/example.jpg?test=true';
    expect(getAbsoluteImageUrl(asset)).toBe('https:' + asset + '&fm=avif');
  });
});
