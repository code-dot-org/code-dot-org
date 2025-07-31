import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {AnchorHTMLAttributes} from 'react';

export interface LinkItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Link label */
  label: string;
  /** Link href */
  href: string;
  /** Typography variant */
  typography?: React.ComponentProps<typeof Typography>['variant'];
}

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
