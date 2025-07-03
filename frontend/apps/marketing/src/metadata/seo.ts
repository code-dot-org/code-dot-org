import {Experience} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';

import {Brand} from '@/config/brand';
import {BRAND_OPENGRAPH_DEFAULT_IMAGE_URL} from '@/config/metadata/opengraph';
import {getSeoMetadataFromExperience} from '@/selectors/contentful/getExperienceEntryFields';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {SeoMetadata} from '@/types/contentful/entries/SeoMetadata';

export function getSeoMetadata(
  experience: Experience | undefined,
  brand: Brand | undefined,
  locale: string,
): Metadata | undefined {
  const seoMetadata = getSeoMetadataFromExperience(experience);

  if (seoMetadata === undefined) {
    return undefined;
  }

  return {
    ...(seoMetadata.seoTitle ? {title: seoMetadata.seoTitle} : undefined),
    description: seoMetadata.seoDescription,
    keywords: seoMetadata.keywords,
    alternates: {
      canonical: seoMetadata.canonicalUrl,
    },
    openGraph: getOpenGraph(seoMetadata, brand, locale),
    robots: getRobots(seoMetadata),
  };
}

function getOpenGraph(
  seoMetadata: SeoMetadata,
  brand: Brand | undefined,
  locale: string,
) {
  const openGraphImage = seoMetadata.openGraphImage;
  // As of July 2025, all open graph providers support JPEG & PNG but there is only partial support for AVIF.
  // Use webp for compatibility.
  const openGraphImageUrl = getAbsoluteImageUrl(openGraphImage, {fm: 'webp'});

  return {
    type: 'website',
    locale: locale,
    title: seoMetadata.openGraphTitle,
    description: seoMetadata.openGraphDescription,
    url: './',
    images:
      openGraphImage && openGraphImageUrl
        ? openGraphImageUrl
        : brand
          ? BRAND_OPENGRAPH_DEFAULT_IMAGE_URL[brand]
          : undefined,
  };
}

function getRobots(seoMetadata: SeoMetadata) {
  const hideFromSearchEngines =
    seoMetadata.hidePageFromSearchEnginesNoindex ?? false;
  const hideLinksFromSearchEngines =
    seoMetadata.hideLinksFromSearchEnginesNofollow ?? false;

  return {
    index: !hideFromSearchEngines,
    follow: !hideLinksFromSearchEngines,
  };
}
