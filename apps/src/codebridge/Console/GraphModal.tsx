import React from 'react';

import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';

import moduleStyles from './console.module.scss';

/**
 * Renders a modal that displays data visualizations from Python Lab console output.
 */

export interface GraphModalProps {
  onClose: () => void;
  key: number;
  src: string;
}

const GraphModal: React.FunctionComponent<GraphModalProps> = ({
  onClose,
  key,
  src,
}) => {
  return (
    <AccessibleDialog onClose={onClose}>
      <button
        type="button"
        onClick={onClose}
        className={moduleStyles.xCloseButton}
      >
        <i id="x-close" className="fa-solid fa-xmark" />
      </button>
      <img key={key} src={src} alt="matplotlib_image" />
    </AccessibleDialog>
  );
};

export default GraphModal;
