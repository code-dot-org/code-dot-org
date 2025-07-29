import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Toolbar from '@mui/material/Toolbar';
import {AnchorHTMLAttributes, HTMLAttributes, Key} from 'react';

import Button from '@/components/contentful/button';
import logoImage from '@public/images/csforall-logo.svg';

export interface SiteLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Custom class */
  className?: string;
}

const headerLinks: SiteLink[] = [
  {
    key: 'issues',
    label: 'Issues',
    href: '/issues',
  },
  {
    key: 'take-action',
    label: 'Take Action',
    href: '/take-action',
  },
  {
    key: 'hour-of-ai',
    label: 'Hour of AI',
    href: '/hour-of-ai',
  },
  {
    key: 'donate',
    label: 'Donate',
    href: '/donate',
  },
  {
    key: 'news-and-resources',
    label: 'News & Resources',
    href: '/news-and-resources',
  },
];

const HeaderCSforAll: React.FC<HeaderProps> = ({className}) => {
  return (
    <AppBar component="header" elevation={0} className={className}>
      <Toolbar variant="dense" disableGutters>
        <Box>
          <Link href="/" aria-label="CSforAll Home">
            <img
              src={logoImage.src}
              alt="CSforAll Logo"
              loading="eager"
              style={{width: '160px'}}
            />
          </Link>
          <List component="nav" aria-label="CSforAll site links">
            {headerLinks.map(link => (
              <ListItem>
                <Link key={link.key} href={link.href} aria-label={link.label}>
                  {link.label}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
        <Button
          type="emphasized"
          size="small"
          href="/signup"
          text="Contact Us"
        />
      </Toolbar>
    </AppBar>
  );
};

export default HeaderCSforAll;
