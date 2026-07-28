/** Auth role, shared across header components. */
export type UserType = 'student' | 'teacher' | 'admin';

/** A single navigation link entry. */
export interface MenuItem {
  /** Display label for the link. */
  label: string;
  /** Destination href. */
  href: string;
  /**
   * When set, this entry shows on the top bar but is omitted from the hamburger
   * drawer — it's already surfaced there via the global nav. Mirror of the
   * global nav's `hamburgerOnly`.
   */
  hideInHamburger?: boolean;
  /**
   * Renders after the flexible space, aligned to the nav's end; the first
   * `alignEnd` item carries the separating margin. Hidden at narrow widths
   * before the main items collapse.
   */
  alignEnd?: boolean;
}

/**
 * A top-level site-nav entry: either a direct link (href) or a group that
 * expands to sub-links (subItems). The two forms are mutually exclusive.
 * `hamburgerOnly` entries (e.g. legal links) show only in the hamburger drawer,
 * never on the top bar. `alignEnd` — see {@link MenuItem.alignEnd}.
 */
export type GlobalNavItem =
  | {
      label: string;
      href: string;
      subItems?: never;
      hamburgerOnly?: boolean;
      alignEnd?: boolean;
    }
  | {
      label: string;
      subItems: MenuItem[];
      href?: never;
      hamburgerOnly?: boolean;
      alignEnd?: boolean;
    };
