import React, {useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import GraphModal from '../Console/GraphModal';
import {sendCodebridgeAnalyticsEvent} from '../utils';

import moduleStyles from './image-preview.module.scss';

const ImagePreview: React.FunctionComponent = () => {
  const images = useAppSelector(state => state.codebridgeConsole.images);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [activeGraphIndex, setActiveGraphIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  if (!images) {
    return null;
  }

  const handleNextImage = () => {
    setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };

  const popOutGraph = (index: number) => {
    sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_POP_OUT_IMAGE, appName);
    setActiveGraphIndex(index);
    setGraphModalOpen(true);
  };

  return (
    <div className={moduleStyles.imageContainer}>
      <div className={moduleStyles.imageAndPopOut}>
        <img
          src={`data:image/png;base64,${images[selectedIndex]}`}
          alt="matplotlib graph"
        />
        <Button
          color={buttonColors.black}
          disabled={false}
          icon={{
            iconName: 'up-right-from-square',
            iconStyle: 'solid',
          }}
          isIconOnly={true}
          onClick={() => popOutGraph(selectedIndex)}
          size="xs"
          type="primary"
          aria-label="open matplotlib_image in pop-up"
        />
        {activeGraphIndex === selectedIndex && graphModalOpen && (
          <GraphModal
            src={`data:image/png;base64,${images[selectedIndex]}`}
            onClose={() => setGraphModalOpen(false)}
          />
        )}
      </div>
      <div className={moduleStyles.buttonBar}>
        <Button
          onClick={handlePrevImage}
          text={codebridgeI18n.previous()}
          iconLeft={{iconName: 'arrow-left'}}
        />
        <Button
          onClick={handleNextImage}
          text={codebridgeI18n.next()}
          iconLeft={{iconName: 'arrow-right'}}
        />
      </div>
    </div>
  );
};

export default ImagePreview;
