import React from 'react';

import {TuneEventValue} from '../player/interfaces/TuneEvent';

import SequenceEditor from './InstrumentGrid';

import moduleStyles from './tunePanel.module.scss';

export interface TunePanelProps {
  initValue: TuneEventValue;
  onChange: (value: TuneEventValue) => void;
}

const TunePanel: React.FunctionComponent<TunePanelProps> = ({
  initValue,
  onChange,
}) => {
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue: TuneEventValue = JSON.parse(JSON.stringify(initValue));

  return (
    <div className={moduleStyles.tunePanelContainer}>
      <SequenceEditor
        initialValue={currentValue}
        editorType="notes"
        onChange={onChange}
        lengthMeasures={1}
      />
    </div>
  );
};

export default TunePanel;
