import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {
  getRelativeImageUrl,
  getOptimizedImageFormat,
  getAbsoluteImageUrl,
} from '../getImage';

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
    const imageFormat = getOptimizedImageFormat('https://test.example/image');
    expect(imageFormat).toBeUndefined();
  });

  it('returns undefined for avif image', () => {
    const imageFormat = getOptimizedImageFormat(
      'https://test.example/image.avif',
    );
    expect(imageFormat).toBeUndefined();
  });

  it('returns undefined for webp image', () => {
    const imageFormat = getOptimizedImageFormat(
      'https://test.example/image.webp',
    );
    expect(imageFormat).toBeUndefined();
  });

  it('returns avif for non-gif images', () => {
    expect(
      getOptimizedImageFormat('https://test.example/image.JPG#test-example'),
    ).toBe('avif');
    expect(
      getOptimizedImageFormat('https://test.example/image.png?test=example'),
    ).toBe('avif');
  });

  it('returns webp for gif images', () => {
    const imageFormat = getOptimizedImageFormat(
      'https://test.example/image.gif',
    );
    expect(imageFormat).toBe('webp');
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
