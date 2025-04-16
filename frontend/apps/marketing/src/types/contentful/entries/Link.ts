import {Entry} from '@/types/contentful/Entry';

export type Link = {
  ariaLabel?: string;
  isThisAnExternalLink: boolean;
  label: string;
  primaryTarget: string;
};

export type LinkEntry = Entry<Link>;
