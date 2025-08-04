import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {useMemo} from 'react';

import {buttonStyles} from './common/styles';
import {LinkItemProps} from './common/types';
import DropdownMenu from './DropdownMenu';

export interface MenuConfig {
  linkList: LinkItemProps[];
  parentId?: string;
}

export interface MenuItemConfig {
  type: 'dropdown' | 'button';
  topLevelLink: LinkItemProps;
  dropdownConfig?: MenuConfig;
}

interface MainMenuDesktopProps {
  /** Main menu items */
  mainMenuDesktopItems: MenuItemConfig[];
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

export const useMenuConfiguration = (
  topLevelLinks: {linkList: LinkItemProps[]} | null,
  dropdownConfigs: Record<string, MenuConfig> = {},
): MenuItemConfig[] => {
  return useMemo(() => {
    if (!topLevelLinks?.linkList) return [];

    return topLevelLinks.linkList.map((link): MenuItemConfig => {
      const dropdownConfig = Object.values(dropdownConfigs).find(
        config => config.parentId === link.id,
      );

      return {
        type: dropdownConfig ? 'dropdown' : 'button',
        topLevelLink: link,
        dropdownConfig,
      };
    });
  }, [topLevelLinks, dropdownConfigs]);
};

const MainMenuDesktop = ({
  mainMenuDesktopItems,
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
        >
          {topLevelLink.label}
        </Button>
      );
    }

    return null;
  };

  return (
    <Box className={className} sx={styles.linkListDesktop}>
      {mainMenuDesktopItems.map(renderMenuItem)}
    </Box>
  );
};

export default MainMenuDesktop;
