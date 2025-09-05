import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import {isExternalLink} from '@/components/common/utils';
import {Brand} from '@/config/brand';
import {getLinksFromEntry} from '@/contentful/get-links-from-entry';

import {buttonStyles} from './common/styles';
import {LinkItemProps} from './common/types';
import {TAKE_ACTION_LINKS, TOP_LEVEL_LINKS} from './config';
import DropdownMenu from './DropdownMenu';

export interface MenuConfig {
  /** Dropdown menu items */
  linkList: LinkItemProps[];
  /** Dropdown parent button id */
  parentId?: string;
}

export interface MenuItemConfig {
  /** Menu item type */
  /** 'dropdown' for a dropdown menu, 'button' for a direct link */
  type: 'dropdown' | 'button';
  /** Top-level link item */
  topLevelLink: LinkItemProps;
  /** Dropdown configuration if type is 'dropdown' */
  dropdownConfig?: MenuConfig;
}

interface MainMenuDesktopProps {
  /** Brand for the links, used with external links */
  brand?: Brand;
  /** Custom class */
  className?: string;
}

const styles = {
  linkListDesktop: {
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
  },
};

// Main Menu Initiatives Dropdown Links
const INITIATIVES_LINKS: {linkList: LinkItemProps[]} = {
  linkList: await getLinksFromEntry('36lird9ux97FVwMw5xNYMH'),
};

// Main Menu Desktop Configuration
const [initiativesLink, takeActionLink, hourOfAiLink, newsLink] =
  TOP_LEVEL_LINKS.linkList;

export const MAIN_MENU_DESKTOP_ITEMS = [
  {
    type: 'dropdown' as const,
    topLevelLink: initiativesLink,
    dropdownConfig: INITIATIVES_LINKS,
  },
  {
    type: 'dropdown' as const,
    topLevelLink: takeActionLink,
    dropdownConfig: TAKE_ACTION_LINKS,
  },
  {
    type: 'button' as const,
    topLevelLink: hourOfAiLink,
  },
  {
    type: 'button' as const,
    topLevelLink: newsLink,
  },
];

const MainMenuDesktop = ({
  brand = Brand.CS_FOR_ALL,
  className = 'link-list-desktop',
}: MainMenuDesktopProps) => {
  const renderMenuItem = (item: MenuItemConfig, index: number) => {
    const {type, topLevelLink, dropdownConfig} = item;
    const key = topLevelLink.id || `${type}-${index}`;

    if (type === 'dropdown' && dropdownConfig) {
      return (
        <DropdownMenu
          key={key}
          id={topLevelLink.id ?? ''}
          buttonLabel={topLevelLink.label}
          linkList={dropdownConfig.linkList}
        />
      );
    }

    if (type === 'button' && topLevelLink.href) {
      return (
        <Button
          key={key}
          variant="text"
          href={topLevelLink.href}
          disableElevation
          disableRipple
          sx={buttonStyles.button}
          target={
            isExternalLink(topLevelLink.href, brand, 'production')
              ? '_blank'
              : undefined
          }
          rel={
            isExternalLink(topLevelLink.href, brand, 'production')
              ? 'noopener noreferrer'
              : undefined
          }
        >
          {topLevelLink.label}
        </Button>
      );
    }

    return null;
  };

  return (
    <Box className={className} sx={styles.linkListDesktop}>
      {MAIN_MENU_DESKTOP_ITEMS.map(renderMenuItem)}
    </Box>
  );
};

export default MainMenuDesktop;
