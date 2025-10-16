import Link from '@mui/material/Link';
import {AnchorHTMLAttributes} from 'react';

import {LinkItemProps} from './common/types';

export interface SiteLogoProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Logo aria label */
  label: LinkItemProps['label'];
  /** Logo URL */
  href: LinkItemProps['href'];
  /** Logo image */
  imgSrc: string;
}

const styles = {
  logoLink: {
    marginBottom: 0,
    lineHeight: 1,
    display: 'block',
    '& img': {
      width: 160,
    },
  },
};

const SiteLogo = (logo: SiteLogoProps) => {
  return (
    <>
      {logo && (
        <Link
          className="logo-link"
          href={logo.href}
          aria-label={logo.label}
          sx={styles.logoLink}
        >
          <img src={logo.imgSrc} alt="" loading="eager" />
        </Link>
      )}
    </>
  );
};

export default SiteLogo;
