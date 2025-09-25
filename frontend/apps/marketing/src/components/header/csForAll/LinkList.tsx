import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import {LinkItemProps} from './common/types';
import LinkItem from './LinkItem';

export interface LinkListProps {
  /** Site links */
  linkList?: LinkItemProps[];
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
        ({id, label, href, typography = 'body3', ...linkProps}) => (
          <ListItem key={id}>
            <LinkItem
              label={label}
              href={href}
              typography={typography}
              {...linkProps}
            />
          </ListItem>
        ),
      )}
    </List>
  );
};

export default LinkList;
