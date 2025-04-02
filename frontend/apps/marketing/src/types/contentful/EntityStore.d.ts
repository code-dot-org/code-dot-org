import {SeoMetadataEntry} from '@/types/contentful/entries/SeoMetadata';

declare module '@contentful/experiences-core/types' {
  interface ExperienceFields {
    seoMetadata?: SeoMetadataEntry;
    pageHeading?: string;
  }
}
