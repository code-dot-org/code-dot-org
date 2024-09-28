import React, {useCallback} from 'react';

import {PatternEventValue} from '../player/interfaces/PatternEvent';
import {InstrumentEventValue} from '../player/interfaces/TuneEvent';

import SequenceEditor from './InstrumentGrid';

interface PatternPanelProps {
  initValue: PatternEventValue;
  onChange: (value: PatternEventValue) => void;
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
    JSON.stringify({...initValue, instrument: initValue.kit})
  );
  const changeCallback = useCallback(
    (newValue: InstrumentEventValue) =>
      onChange({...newValue, kit: newValue.instrument}), // TODO Fix types / missing src
    [onChange]
  );

  return (
    <SequenceEditor
      editorType="drums"
      initialValue={currentValue}
      onChange={changeCallback}
      lengthMeasures={1}
    />
  );
};

export default PatternPanel;
