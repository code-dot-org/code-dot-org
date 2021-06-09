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
  id,
  className,
  children,
  closeButtonId,
  closeButtonClassName
}) {
  return (
    <BaseDialog isOpen={isOpen} bodyId={id} bodyClassName={className}>
      {children}
      <div id={closeButtonId} className={closeButtonClassName} />
    </BaseDialog>
  );
}

CraftDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
  closeButtonId: PropTypes.string,
  closeButtonClassName: PropTypes.string,
  children: PropTypes.node
};

CraftDialog.defaultProps = {
  className: 'craft-popup',
  closeButtonClassName: 'craft-close-popup'
};
