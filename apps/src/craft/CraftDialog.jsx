import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

/**
 * A version of <BaseDialog/> with Minecraft styles.
 *
 * Note: This component relies on styles defined in apps/style/craft/style.scss.
 */
export default function CraftDialog({
  isOpen,
  handleClose,
  id,
  className,
  children
}) {
  return (
    <BaseDialog
      isOpen={isOpen}
      handleClose={handleClose}
      bodyId={id}
      bodyClassName={className}
    >
      {children}
    </BaseDialog>
  );
}

CraftDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};

CraftDialog.defaultProps = {
  className: 'minecraft dash_modal craft-popup'
};
