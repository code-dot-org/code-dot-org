import classNames from 'classnames';
import {Key, AnchorHTMLAttributes, HTMLAttributes} from 'react';

import moduleStyles from './header.module.scss';

export interface MainLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
}

export interface MainLinksProps extends HTMLAttributes<HTMLElement> {
  /** Main links */
  mainLinks: MainLink[];
  /** Main links custom class name */
  className?: string;
}

const MainLinks: React.FC<MainLinksProps> = ({mainLinks, className}) => {
  return (
    <ul
      className={classNames(moduleStyles.mainLinks, className)}
      aria-label="Main site links"
    >
      {mainLinks?.map(({key, label, href, ...link}) => (
        <li key={key}>
          <a href={href} {...link}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default MainLinks;
