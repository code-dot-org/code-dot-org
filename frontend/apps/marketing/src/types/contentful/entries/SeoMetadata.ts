import {Entry} from '@/types/contentful/Entry';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

export type SeoMetadata = {
  seoTitle: string;
  seoDescription: string;
  hidePageFromSearchEnginesNoindex: boolean;
  hideLinksFromSearchEnginesNofollow: boolean;
  keywords: string[];
  canonicalUrl: string;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImage: ExperienceAsset;
};

export type SeoMetadataEntry = Entry<SeoMetadata>;
