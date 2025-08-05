import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import {isExternalLink} from '@/components/common/utils';
import {Brand} from '@/config/brand';

import {LinkItemProps} from './common/types';

const LinkItem = ({
  brand = Brand.CS_FOR_ALL,
  label,
  href = '',
  typography = 'body3',
  ...linkProps
}: LinkItemProps) => {
  return (
    <Typography
      variant={typography}
      component={Link}
      href={href}
      sx={{textDecoration: 'none'}}
      target={isExternalLink(href, brand, 'production') ? '_blank' : undefined}
      rel={
        isExternalLink(href, brand, 'production')
          ? 'noopener noreferrer'
          : undefined
      }
      {...linkProps}
    >
      {label}
    </Typography>
  );
};

export default LinkItem;
