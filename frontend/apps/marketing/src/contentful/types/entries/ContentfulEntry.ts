import {BaseEntry} from 'contentful';

export type ContentfulEntry<ContentfulEntryFields> = BaseEntry & {
  fields: ContentfulEntryFields;
};
