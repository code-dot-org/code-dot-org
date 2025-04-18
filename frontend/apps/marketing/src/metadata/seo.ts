import {Experience} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';

import {getSeoMetadataFromExperience} from '@/selectors/contentful/getExperienceEntryFields';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {SeoMetadata} from '@/types/contentful/entries/SeoMetadata';

export function getSeoMetadata(
  experience: Experience | undefined,
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
    openGraph: getOpenGraph(seoMetadata, locale),
    robots: getRobots(seoMetadata),
  };
}

function getOpenGraph(seoMetadata: SeoMetadata, locale: string) {
  const openGraphImage = seoMetadata.openGraphImage;
  const openGraphAssetFile = openGraphImage?.fields?.file;
  const openGraphImageDetails = openGraphAssetFile?.details?.image;
  const openGraphImageUrl = getAbsoluteImageUrl(openGraphImage);

  return {
    type: 'website',
    locale: locale,
    title: seoMetadata.openGraphTitle,
    description: seoMetadata.openGraphDescription,
    url: './',
    images:
      openGraphImage && openGraphImageUrl
        ? [
            {
              url: openGraphImageUrl,
              width: openGraphImageDetails?.width,
              height: openGraphImageDetails?.height,
            },
          ]
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
