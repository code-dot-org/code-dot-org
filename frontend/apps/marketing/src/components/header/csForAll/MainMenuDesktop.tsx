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
  const [
    issuesLink,
    takeActionLink,
    aboutLink,
    joinLink,
    newsAndResourcesLink,
  ] = TOP_LEVEL_LINKS.linkList;
  return (
    <Box className="link-list-desktop" sx={styles.linkListDesktop}>
      <DropdownMenu
        id={issuesLink?.id ?? ''}
        label={issuesLink?.label ?? ''}
        linkList={ISSUES_LINKS.linkList}
      />
      <DropdownMenu
        id={takeActionLink?.id ?? ''}
        label={takeActionLink?.label ?? ''}
        linkList={TAKE_ACTION_LINKS.linkList}
      />
      <Button
        variant="text"
        href={aboutLink.href}
        disableElevation
        disableRipple
        sx={buttonStyles.button}
      >
        {aboutLink.label}
      </Button>
      <Button
        variant="text"
        href={joinLink.href}
        disableElevation
        disableRipple
        sx={buttonStyles.button}
      >
        {joinLink.label}
      </Button>
      <DropdownMenu
        id={newsAndResourcesLink?.id ?? ''}
        label={newsAndResourcesLink.label}
        linkList={NEWS_AND_RESOURCES_LINKS.linkList}
      />
    </Box>
  );
};

export default MainMenuDesktop;
