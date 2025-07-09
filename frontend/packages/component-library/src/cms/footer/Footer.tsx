import classNames from 'classnames';
import {Key, HTMLAttributes, AnchorHTMLAttributes} from 'react';

import {DefaultDropdown} from '@/dropdown/simpleDropdown/stories/SimpleDropdown.story';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
// Hiding temporarily, see https://codedotorg.atlassian.net/browse/CMS-886
// import Image, {ImageProps} from '@/image';

import moduleStyles from './footer.module.scss';

export interface SiteLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
}

export interface SocialLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
  icon: FontAwesomeV6IconProps;
}

// Hiding temporarily, see https://codedotorg.atlassian.net/browse/CMS-886
// export interface ImageLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
//   key: Key;
//   label: string;
//   href: string;
//   image: ImageProps;
// }

export interface LanguageOption {
  value: string;
  text: string;
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Footer links */
  siteLinks: SiteLink[];
  /** Footer social links */
  socialLinks: SocialLink[];
  // Hiding temporarily, see https://codedotorg.atlassian.net/browse/CMS-886
  // /** Footer bottom image links */
  // imageLinks: ImageLink[];
  /** Footer copyright notices */
  copyright: string;
  /** Footer language options */
  languages: LanguageOption[];
  /** Callback for language change */
  onLanguageChange: (args: string) => void;
  /** The selected locale code for the language dropdown */
  selectedLocaleCode?: string;
  /** Footer brand */
  brand?: string;
  /** Footer class */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Footer.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: Footer Component.
 * Acts as the main page footer.
 */
const Footer: React.FC<FooterProps> = ({
  brand = 'Code.org',
  siteLinks,
  socialLinks,
  // imageLinks, // Hiding temporarily, see https://codedotorg.atlassian.net/browse/CMS-886
  copyright,
  className,
  languages,
  selectedLocaleCode,
  onLanguageChange,
  ...HTMLAttributes
}) => (
  <footer
    {...HTMLAttributes}
    className={classNames(moduleStyles.footer, className)}
  >
    <div className={moduleStyles.footerContent}>
      <label
        className={moduleStyles.footerLinkListToggle}
        aria-label="Click to expand or collapse Site links"
      >
        <input type="checkbox" aria-hidden="true" />
        {brand}
        <FontAwesomeV6Icon iconName="chevron-down" aria-hidden="true" />
      </label>

      <ul className={moduleStyles.footerLinkList} aria-label="Site links">
        {siteLinks?.map(({key, label, href, ...link}) => (
          <li key={key}>
            <a href={href} {...link}>
              {label}
            </a>
          </li>
        ))}
      </ul>

      <DefaultDropdown
        className={classNames(
          'notranslate',
          moduleStyles.footerLanguageDropdown,
        )}
        size={'s'}
        dropdownTextThickness={'thin'}
        color={'white'}
        items={languages}
        onChange={e => onLanguageChange(e.target.value)}
        labelText={''}
        selectedValue={selectedLocaleCode}
        name={'language'}
        aria-label={'Language selection dropdown'}
      />

      <small className={moduleStyles.footerCopyright}>{copyright}</small>

      <ul className={moduleStyles.footerSocialList} aria-label="Social links">
        {socialLinks?.map(({key, label, href, icon, ...link}) => (
          <li key={key}>
            <a href={href} aria-label={label} {...link}>
              <FontAwesomeV6Icon {...icon} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      {/* Hiding temporarily, see https://codedotorg.atlassian.net/browse/CMS-886 */}
      {/* <ul className={moduleStyles.footerImageLinkList}>
        {imageLinks?.map(({key, label, href, image, ...link}) => (
          <li key={key}>
            <a href={href} aria-label={label} {...link}>
              <Image
                {...image}
                className={moduleStyles.footerImageLinkListImg}
                altText={image.altText || label}
              />
            </a>
          </li>
        ))}
      </ul> */}
    </div>
  </footer>
);

export default Footer;
