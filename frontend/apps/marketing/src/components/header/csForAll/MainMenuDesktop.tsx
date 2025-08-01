import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {alpha} from '@mui/material/styles';

import theme from '@/themes/csforall';

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
  button: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.body3.fontSize,
    textDecoration: 'none',
    marginBottom: 0,
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
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
        sx={styles.button}
      >
        {TOP_LEVEL_LINKS.linkList[2].label}
      </Button>
      <Button
        variant="text"
        href={TOP_LEVEL_LINKS.linkList[3].href}
        disableElevation
        disableRipple
        sx={styles.button}
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
