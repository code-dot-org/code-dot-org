import {SeoMetadataEntry} from '@/types/contentful/entries/SeoMetadata';

/**
 * Overrides the experience fields type to include the custom entries added to the top-level of the experience entry type.
 */
declare module '@contentful/experiences-core/types' {
  interface ExperienceFields {
    seoMetadata?: SeoMetadataEntry;
    pageHeading?: string;
  }
}
