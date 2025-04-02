import {EntrySkeletonType} from 'contentful';

export type Link = {
  ariaLabel?: string;
  isThisAnExternalLink: boolean;
  label: string;
  primaryTarget: string;
};

export type LinkEntry = EntrySkeletonType<Link>;
