import Box from '@mui/material/Box';

import {
  ISSUES_LINKS,
  NEWS_AND_RESOURCES_LINKS,
  TAKE_ACTION_LINKS,
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
        id="issues-menu"
        label="Issues"
        linkList={ISSUES_LINKS.linkList}
      />
      <DropdownMenu
        id="take-action-menu"
        label="Take Action"
        linkList={TAKE_ACTION_LINKS.linkList}
      />
      <DropdownMenu
        id="news-and-resources-menu"
        label="News & Resources"
        linkList={NEWS_AND_RESOURCES_LINKS.linkList}
      />
    </Box>
  );
};

export default MainMenuDesktop;
