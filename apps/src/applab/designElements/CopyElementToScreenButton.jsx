import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  Typography as MuiTypography,
  Menu,
  MenuItem,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import applabMsg from '@cdo/applab/locale';

/**
 * A duplicate button that helps replicate elements
 */
const CopyElementToScreenButton = ({
  currentScreenId,
  handleCopyElementToScreen,
  screenIds,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleDropdownClick = event => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClick = screenId => {
    setAnchorEl(null);
    handleCopyElementToScreen(screenId);
  };

  const onClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <MuiButton
        id="copy-to-screen"
        variant="outlined"
        color="secondary"
        size="small"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleDropdownClick}
        endIcon={
          <FontAwesomeV6Icon iconName="chevron-down" iconStyle="solid" />
        }
      >
        {applabMsg.designWorkspace_copyToScreenButton()}
      </MuiButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        MenuListProps={{
          'aria-labelledby': 'copy-to-screen',
        }}
      >
        {screenIds
          .filter(screenId => screenId !== currentScreenId)
          .map(screenId => (
            <MenuItem onClick={() => handleMenuClick(screenId)} key={screenId}>
              <MuiTypography variant="label3">{screenId}</MuiTypography>
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
};

CopyElementToScreenButton.propTypes = {
  // From connect
  currentScreenId: PropTypes.string.isRequired,

  // Passed explicitly
  handleCopyElementToScreen: PropTypes.func.isRequired,
  screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default connect(function propsFromStore(state) {
  return {
    currentScreenId: state.screens.currentScreenId,
  };
})(CopyElementToScreenButton);
