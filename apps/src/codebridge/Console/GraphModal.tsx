import React from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import i18n from '@cdo/locale';

import moduleStyles from './console.module.scss';

/**
 * Renders a modal that displays data visualization Python lab console output.
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
      <img
        key={key}
        src={src}
        alt="matplotlib_image"
      />
    </AccessibleDialog>
  );

  
}
  
  
  
  
  
export default GraphModal;