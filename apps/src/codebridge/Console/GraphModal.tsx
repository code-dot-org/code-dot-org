import React, {useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import CloseButton from '@cdo/apps/componentLibrary/closeButton/CloseButton';
import i18n from '@cdo/locale';

import styles from './console.module.scss';
import dialogStyles from '@cdo/apps/sharedComponents/accessible-dialogue.module.scss';

/**
 * Renders a modal that displays data visualizations from Python Lab console output.
 */

interface GraphModalProps {
  onClose: () => void;
  src: string;
}

const GraphModal: React.FunctionComponent<GraphModalProps> = ({
  onClose,
  src,
}) => {
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  const onStopHandler: DraggableEventHandler = (e, data) => {
    setPositionX(data.x);
    setPositionY(data.y);
  };

  return (
    <Draggable
      defaultPosition={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      <div className={styles.popOutGraph}>
        <CloseButton
          className={dialogStyles.xCloseButton}
          aria-label={i18n.closeDialog()}
          onClick={onClose}
        />
        <img src={src} alt="matplotlib_image" />
      </div>
    </Draggable>
  );
};

export default GraphModal;
