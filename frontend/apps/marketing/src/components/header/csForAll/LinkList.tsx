import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import {AnchorHTMLAttributes, Key} from 'react';

export interface LinkItem extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Unique link key */
  key: Key;
  /** Link label */
  label: string;
  /** Link href */
  href: string;
  /** Typography variant */
  typography?: React.ComponentProps<typeof Typography>['variant'];
}

export interface LinkListProps {
  /** Site links */
  linkList?: LinkItem[];
  /** Aria label for the list */
  ariaLabel?: string;
  /** Custom class */
  className?: string;
}

const LinkList = ({linkList, ariaLabel, className}: LinkListProps) => {
  return (
    <List
      className={className}
      component="ul"
      aria-label={ariaLabel}
      sx={{padding: 0}}
    >
      {linkList?.map(
        ({key, label, href, typography = 'body2', ...linkProps}) => (
          <ListItem key={key}>
            <Typography
              variant={typography}
              component={Link}
              href={href}
              sx={{textDecoration: 'none'}}
              {...linkProps}
            >
              {label}
            </Typography>
          </ListItem>
        ),
      )}
    </List>
  );
};

export default LinkList;
