import {Key, AnchorHTMLAttributes} from 'react';

export interface HeaderLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Unique key for the link */
  key: Key;
  /** Link label */
  label: string;
  /** Link href */
  href: string;
  /** Use this if the link needs to show/hide based on screen size */
  hasDisplayLogic?: boolean;
}
