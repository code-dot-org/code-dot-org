import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import theme from '@/themes/csforall';

export interface MenuButtonProps {
  /** Click handler for the menu button */
  onClick: () => void;
}

const styles = {
  closeButton: {
    width: 'auto',
    position: 'absolute',
    insetBlockStart: theme.spacing(2.25),
    insetInlineEnd: theme.spacing(1.5),
    zIndex: 1000,
    '& svg': {
      color: theme.palette.common.black,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
};

const CloseButton = ({onClick}: MenuButtonProps) => {
  return (
    <IconButton
      aria-label="Close menu"
      onClick={onClick}
      disableRipple
      sx={styles.closeButton}
    >
      <CloseIcon fontSize="large" />
    </IconButton>
  );
};

export default CloseButton;
