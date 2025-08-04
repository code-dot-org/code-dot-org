import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import {LinkItemProps} from './common/types';

const LinkItem = ({
  label,
  href,
  typography = 'body3',
  ...linkProps
}: LinkItemProps) => {
  return (
    <Typography
      variant={typography}
      component={Link}
      href={href}
      sx={{textDecoration: 'none'}}
      {...linkProps}
    >
      {label}
    </Typography>
  );
};

export default LinkItem;
