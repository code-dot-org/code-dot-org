import {Entry} from '@/types/contentful/Entry';

export type Link = {
  ariaLabel?: string;
  isThisAnExternalLink: boolean;
  linkName?: string;
  label: string;
  primaryTarget: string;
};

export type LinkEntry = Entry<Link>;
