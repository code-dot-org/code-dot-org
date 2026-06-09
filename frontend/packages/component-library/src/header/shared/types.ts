/** Auth role, shared across header components. */
export type UserType = 'student' | 'teacher' | 'admin';

/** A single navigation link entry. */
export interface MenuItem {
  /** Display label for the link. */
  label: string;
  /** Destination href. */
  href: string;
}

/** A top-level site-nav entry; either a direct link or a group with sub-links. */
export interface GlobalNavItem {
  /** Display label for the entry. */
  label: string;
  /** Destination href for a direct-link entry. */
  href?: string;
  /** Sub-links rendered in an expandable section; omit for a direct link. */
  subItems?: MenuItem[];
}
