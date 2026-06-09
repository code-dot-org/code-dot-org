/** Auth role, shared across header components. */
export type UserType = 'student' | 'teacher' | 'admin';

/** A single navigation link entry. */
export interface MenuItem {
  /** Display label for the link. */
  label: string;
  /** Destination href. */
  href: string;
}
