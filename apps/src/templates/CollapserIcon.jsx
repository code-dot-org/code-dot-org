import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

function CollapserIcon({id, isCollapsed, onClick, style, className}) {
  return (
    <MuiIconButton
      type="button"
      variant="outlined"
      color="secondary"
      size="extraSmall"
      aria-label={isCollapsed ? 'Expand instructions' : 'Collapse instructions'}
      id={id}
      onClick={onClick}
      style={style}
      sx={{
        borderRadius: '50%',
        height: '1rem',
        width: '1rem',
      }}
    >
      <FontAwesomeV6Icon
        iconName={isCollapsed ? 'chevron-down' : 'chevron-up'}
        iconStyle="solid"
      />
    </MuiIconButton>
  );
}

CollapserIcon.propTypes = {
  id: PropTypes.string,
  onClick: PropTypes.func,
  isCollapsed: PropTypes.bool.isRequired,
  collapsedIconClass: PropTypes.string,
  expandedIconClass: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
};

CollapserIcon.defaultProps = {
  style: {},
};

export default CollapserIcon;
