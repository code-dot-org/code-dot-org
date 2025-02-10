import React, {useCallback} from 'react';

import {InstrumentEventValue} from '../player/interfaces/InstrumentEvent';

import SequenceEditor from './InstrumentGrid';

interface PatternPanelProps {
  initValue: InstrumentEventValue;
  onChange: (value: InstrumentEventValue) => void;
}

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldPattern}
 */
const PatternPanel: React.FunctionComponent<PatternPanelProps> = ({
  initValue,
  onChange,
}) => {
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue: InstrumentEventValue = JSON.parse(
    JSON.stringify(initValue)
  );


  return (
    <SequenceEditor
      editorType="drums"
      initialValue={currentValue}
      onChange={onChange}
      lengthMeasures={1}
    />
  );
};

export default PatternPanel;
