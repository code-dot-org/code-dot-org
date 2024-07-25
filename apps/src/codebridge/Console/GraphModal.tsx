import React from 'react';

import AccessibleDialog from '@cdo/apps/olderSharedComponents/AccessibleDialog';

import moduleStyles from '@cdo/apps/templates/accessible-dialogue.module.scss';

/**
 * Renders a modal that displays data visualizations from Python Lab console output.
 */

export interface GraphModalProps {
  onClose: () => void;
  src: string;
}

const GraphModal: React.FunctionComponent<GraphModalProps> = ({
  onClose,
  src,
}) => {
  return (
    <AccessibleDialog onClose={onClose} closeOnClickBackdrop={true}>
      <button
        type="button"
        onClick={onClose}
        className={moduleStyles.xCloseButton}
      >
        <i id="x-close" className="fa-solid fa-xmark" aria-hidden={true} />
        <span className="sr-only">Close</span>
      </button>
      <img src={src} alt="matplotlib_image" />
    </AccessibleDialog>
  );
};

export default GraphModal;
