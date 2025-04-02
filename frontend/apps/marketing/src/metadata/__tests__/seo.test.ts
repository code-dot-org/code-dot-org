import {Experience} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';

import {getSeoMetadataFromExperience} from '@/contentful/selectors/getExperienceEntryFields';
import {getAbsoluteImageUrl} from '@/contentful/selectors/getImage';
import {SeoMetadata} from '@/types/contentful/entries/SeoMetadata';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import {getSeoMetadata} from '../seo';

jest.mock('@/contentful/selectors/getExperienceEntryFields', () => ({
  getSeoMetadataFromExperience: jest.fn(),
}));
jest.mock('@/contentful/selectors/getImage', () => ({
  getAbsoluteImageUrl: jest.fn(),
}));

const mockSeoMetadata: SeoMetadata = {
  seoTitle: 'Test Title',
  seoDescription: 'Test Description',
  keywords: ['test', 'seo'],
  canonicalUrl: 'https://example.com',
  openGraphTitle: 'OG Title',
  openGraphDescription: 'OG Description',
  openGraphImage: {
    fields: {
      file: {
        contentType: 'image/jpeg',
        fileName: 'test-image.jpg',
        url: '/test-image.jpg',
        details: {
          size: 0,
          image: {
            width: 1200,
            height: 630,
          },
        },
      },
    },
  } as ExperienceAsset,
  hidePageFromSearchEnginesNoindex: false,
  hideLinksFromSearchEnginesNofollow: false,
};

const mockExperience: Experience = {} as Experience;

describe('getSeoMetadata', () => {
  beforeEach(() => {
    (getSeoMetadataFromExperience as jest.Mock).mockReturnValue(
      mockSeoMetadata,
    );
    (getAbsoluteImageUrl as jest.Mock).mockReturnValue(
      'https://example.com/test-image.jpg',
    );
  });

  it('should return metadata when seoMetadata is defined', () => {
    const locale = 'en-US';
    const result = getSeoMetadata(mockExperience, locale);

    expect(result).toEqual<Metadata>({
      title: 'Test Title',
      description: 'Test Description',
      keywords: ['test', 'seo'],
      alternates: {
        canonical: 'https://example.com',
      },
      openGraph: {
        type: 'website',
        locale: 'en-US',
        title: 'OG Title',
        description: 'OG Description',
        url: './',
        images: [
          {
            url: 'https://example.com/test-image.jpg',
            width: 1200,
            height: 630,
          },
        ],
      },
      robots: {
        index: true,
        follow: true,
      },
    });
  });

  it('should return undefined when seoMetadata is undefined', () => {
    (getSeoMetadataFromExperience as jest.Mock).mockReturnValue(undefined);

    const result = getSeoMetadata(mockExperience, 'en-US');

    expect(result).toBeUndefined();
  });

  it('should handle missing openGraphImage gracefully', () => {
    const locale = 'en-US';
    const seoMetadataWithoutImage = {
      ...mockSeoMetadata,
      openGraphImage: undefined,
    };
    (getSeoMetadataFromExperience as jest.Mock).mockReturnValue(
      seoMetadataWithoutImage,
    );

    const result = getSeoMetadata(mockExperience, locale);

    expect(result?.openGraph?.images).toBeUndefined();
  });

  it('should handle missing robots metadata gracefully', () => {
    const seoMetadataWithoutRobots = {
      ...mockSeoMetadata,
      hidePageFromSearchEnginesNoindex: undefined,
      hideLinksFromSearchEnginesNofollow: undefined,
    };
    (getSeoMetadataFromExperience as jest.Mock).mockReturnValue(
      seoMetadataWithoutRobots,
    );

    const result = getSeoMetadata(mockExperience, 'en-US');

    expect(result?.robots).toEqual({
      index: true,
      follow: true,
    });
  });
});
