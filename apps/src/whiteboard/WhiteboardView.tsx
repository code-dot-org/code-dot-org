import {Excalidraw} from '@excalidraw/excalidraw';
import React from 'react';

import moduleStyles from './styles/whiteboard-view.module.scss';

const WhiteboardView: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.whiteboardContainer}>
      <div className={moduleStyles.whiteboardCanvas}>
        <Excalidraw />
      </div>
    </div>
  );
};

export default WhiteboardView;
