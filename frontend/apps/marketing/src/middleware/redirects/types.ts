import {EntrySkeletonType} from 'contentful';

export type RedirectContentType = EntrySkeletonType<{
  oldUrl: string;
  newUrl: string;
}>;
