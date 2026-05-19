import type {ReactNode} from 'react';

/** A site navigation link rendered in the footer link bar. */
export interface FooterSiteLink {
  id: string;
  label: string;
  href: string;
  /** When true, opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  /** When true the link renders with the theme's accent color (e.g. brand orange). */
  accent?: boolean;
}

/** The attribution image link rendered at the bottom. */
export interface FooterImageLink {
  src: string;
  altText: string;
  href: string;
  /** When true, opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
}

/** A single option in the language picker. */
export interface FooterLanguageOption {
  /** Language code passed to onLanguageChange. */
  value: string;
  /** Human-readable language name rendered in the option. */
  text: string;
}

/** Props for the Footer design-system primitive. */
export interface FooterProps {
  /** Navigation links rendered as a pipe-separated inline list. */
  siteLinks: FooterSiteLink[];
  /**
   * Pre-composed copyright / trademark line. Typically a ReactNode produced
   * by the studio composer so the year `<span>` selector stays at the source.
   */
  copyright: ReactNode;
  /** Art-credits + trademark block, rendered below copyright. */
  fineprint?: ReactNode;
  /** Attribution image + link, rendered at the very bottom. */
  imageLink?: FooterImageLink;
  /**
   * Available languages for the locale picker, or `'loading'` to show a
   * skeleton while the list is being fetched. Passing `'loading'` avoids a
   * 1→N option flicker when the language list resolves asynchronously.
   */
  languages: FooterLanguageOption[] | 'loading';
  /** Currently selected locale code (controls the picker's selected option). */
  selectedLocaleCode: string;
  /** Called with the chosen language code when the user changes the picker. */
  onLanguageChange: (code: string) => void;
  className?: string;
}
