import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React from 'react';

interface DebugPanelLeftHeaderButtonsProps {
  selectedPanel: 'network' | 'console';
  setSelectedPanel: (panel: 'network' | 'console') => void;
}

const DebugPanelLeftHeaderButtons: React.FunctionComponent<
  DebugPanelLeftHeaderButtonsProps
> = ({selectedPanel, setSelectedPanel}) => {
  return (
    <SegmentedButtons
      buttons={[
        {value: 'console', label: 'Console', iconLeft: {iconName: 'terminal'}},
        {value: 'network', label: 'Network', iconLeft: {iconName: 'globe'}},
      ]}
      selectedButtonValue={selectedPanel}
      onChange={value => setSelectedPanel(value as 'network' | 'console')}
      size={'xs'}
    />
  );
};

export default DebugPanelLeftHeaderButtons;
