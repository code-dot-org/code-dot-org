import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {Link} from './types';

import moduleStyles from './header.module.scss';

export interface MainLinksProps extends HTMLAttributes<HTMLElement> {
  /** Main links */
  mainLinks: Link[];
  /** Main links custom class name */
  className?: string;
}

const MainLinks: React.FC<MainLinksProps> = ({mainLinks, className}) => {
  return (
    <ul
      className={classNames(moduleStyles.mainLinks, className)}
      aria-label="Main site links"
    >
      {mainLinks?.map(({key, label, href, hasDisplayLogic, ...link}) => (
        <li
          key={key}
          className={hasDisplayLogic ? moduleStyles.hasDisplayLogic : ''}
        >
          <a href={href} {...link}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default MainLinks;
