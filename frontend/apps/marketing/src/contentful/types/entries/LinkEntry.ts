import {ContentfulEntry} from '@/contentful/types/entries/ContentfulEntry';

type LinkEntryFields = {
  ariaLabel?: string;
  isThisAnExternalLink: boolean;
  label: string;
  primaryTarget: string;
};

export type LinkEntry = ContentfulEntry<LinkEntryFields>;
