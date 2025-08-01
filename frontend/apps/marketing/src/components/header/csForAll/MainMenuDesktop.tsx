import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import {buttonStyles} from './common/styles';
import {
  ISSUES_LINKS,
  NEWS_AND_RESOURCES_LINKS,
  TAKE_ACTION_LINKS,
  TOP_LEVEL_LINKS,
} from './config';
import DropdownMenu from './DropdownMenu';

const styles = {
  linkListDesktop: {
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
  },
};

const MainMenuDesktop = () => {
  return (
    <Box className="link-list-desktop" sx={styles.linkListDesktop}>
      <DropdownMenu
        id={TOP_LEVEL_LINKS?.linkList[0].id ?? ''}
        label={TOP_LEVEL_LINKS?.linkList[0].label ?? ''}
        linkList={ISSUES_LINKS.linkList}
      />
      <DropdownMenu
        id={TOP_LEVEL_LINKS?.linkList[1].id ?? ''}
        label={TOP_LEVEL_LINKS?.linkList[1].label ?? ''}
        linkList={TAKE_ACTION_LINKS.linkList}
      />
      <Button
        variant="text"
        href={TOP_LEVEL_LINKS.linkList[2].href}
        disableElevation
        disableRipple
        sx={buttonStyles.button}
      >
        {TOP_LEVEL_LINKS.linkList[2].label}
      </Button>
      <Button
        variant="text"
        href={TOP_LEVEL_LINKS.linkList[3].href}
        disableElevation
        disableRipple
        sx={buttonStyles.button}
      >
        {TOP_LEVEL_LINKS.linkList[3].label}
      </Button>
      <DropdownMenu
        id={TOP_LEVEL_LINKS.linkList[4].id ?? ''}
        label={TOP_LEVEL_LINKS.linkList[4].label}
        linkList={NEWS_AND_RESOURCES_LINKS.linkList}
      />
    </Box>
  );
};

export default MainMenuDesktop;
