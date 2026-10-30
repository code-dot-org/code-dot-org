import React, {useRef} from 'react';

import PanelsView from '@cdo/apps/panels/PanelsView';
import useElementSize from '@cdo/apps/util/hooks/useElementSize';

import {PanelsStep as PanelsStepContent} from '../../types';

import styles from './stepPlayer.module.scss';

interface PanelsStepProps {
  step: PanelsStepContent;
  /** Called when the student continues past the last panel. */
  onComplete: () => void;
}

/** Renders a panels step with the panels level viewer, sized to its host. */
const PanelsStep: React.FunctionComponent<PanelsStepProps> = ({
  step,
  onComplete,
}) => {
  const host = useRef<HTMLDivElement>(null);
  const [width, height] = useElementSize(host);

  return (
    <div ref={host} className={styles.panelsHost}>
      {width > 0 && (
        <PanelsView
          panels={step.panels}
          onContinue={() => onComplete()}
          targetWidth={width}
          targetHeight={height}
          offerBrowserTts={false}
          levelId={null}
        />
      )}
    </div>
  );
};

export default PanelsStep;
