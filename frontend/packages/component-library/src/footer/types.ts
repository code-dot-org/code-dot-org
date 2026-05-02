import type {HTMLAttributes, ReactNode} from 'react';

/** A single site navigation link in the footer link list. */
export interface FooterSiteLink {
  /** Stable identifier used as the React list key. */
  id: string;
  /** Visible link text (English; LocalizeJS auto-translates in the DOM). */
  label: string;
  /** Fully-qualified URL or absolute path. */
  href: string;
  /**
   * When true the anchor gets `rel="noopener noreferrer"` and `target="_blank"`.
   * Applied uniformly by the internal FooterLink wrapper.
   */
  external?: boolean;
}

/** The AWS (or similar) attribution image rendered at the bottom of the footer. */
export interface FooterImageLink {
  /** Image source URL (bundled asset path or remote URL). */
  src: string;
  /** Non-empty alt text required for accessibility. */
  altText: string;
  /** Destination href for the wrapping anchor. */
  href: string;
  /** When true the anchor gets external-link attributes. */
  external?: boolean;
}

/** A single language option in the locale picker. */
export interface FooterLanguageOption {
  /** BCP-47 language code used as the option value and `selectedLocaleCode` match. */
  value: string;
  /** Human-readable language name displayed in the picker. */
  text: string;
}

/** Props for the Footer design-system component. */
export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Ordered list of site navigation links. */
  siteLinks: FooterSiteLink[];
  /** Pre-composed copyright/trademark line (ReactNode so the year can be wrapped). */
  copyright: ReactNode;
  /** Optional fineprint block (credits, legal notices). */
  fineprint?: ReactNode;
  /** Optional attribution image link (e.g. "Powered by AWS"). */
  imageLink?: FooterImageLink;
  /** Available locale options for the language picker. */
  languages: FooterLanguageOption[];
  /** BCP-47 code of the currently selected locale. */
  selectedLocaleCode: string;
  /** Called with the newly chosen locale code when the user picks a language. */
  onLanguageChange: (code: string) => void;
  /**
   * When true the language picker renders a skeleton placeholder instead of
   * the populated control — used while the locale list is still loading.
   */
  languagesLoading?: boolean;
  /** Additional className forwarded to the root `<footer>` element. */
  className?: string;
}
