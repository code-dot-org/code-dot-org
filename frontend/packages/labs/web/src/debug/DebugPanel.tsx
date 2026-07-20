import {IconButton} from '@mui/material';
import {useState} from 'react';

import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {PanelContainer} from '@code-dot-org/lab';

import {Console} from './Console';
import {useDebug} from './DebugContext';
import styles from './debugPanel.module.css';
import {NetworkPanel} from './NetworkPanel';

// The debug panel: what the student's page logged, and what it requested over
// the network. Ported from apps/src/weblab2/debugPanel/. The panes live in
// Console and NetworkPanel; this is the container and its header.
//
// The panel is opened from the preview toolbar and closed from either place, so
// its open state lives in DebugContext rather than here.

type SelectedPanel = 'console' | 'network';

export interface DebugPanelProps {
  className?: string;
}

export const DebugPanel = ({className}: DebugPanelProps) => {
  const [selectedPanel, setSelectedPanel] = useState<SelectedPanel>('console');
  const {logs, requests, clearLogs, clearRequests, setIsOpen} = useDebug();

  // The clear button acts on the pane you are looking at, as legacy's does.
  const isConsole = selectedPanel === 'console';
  const clearLabel = isConsole
    ? 'Clear console logs'
    : 'Clear network requests';
  const isEmpty = (isConsole ? logs : requests).length === 0;

  return (
    <PanelContainer
      id="debug-panel-container"
      className={className}
      headerContent="Debug"
      leftHeaderContent={
        <SegmentedButtons
          buttons={[
            {
              value: 'console',
              label: 'Console',
              iconLeft: {iconName: 'terminal'},
            },
            {value: 'network', label: 'Network', iconLeft: {iconName: 'globe'}},
          ]}
          selectedButtonValue={selectedPanel}
          onChange={value => setSelectedPanel(value as SelectedPanel)}
          size="xs"
        />
      }
      rightHeaderContent={
        <span className={styles.headerButtons}>
          <WithTooltip
            tooltipProps={{
              text: clearLabel,
              size: 'xs',
              direction: 'onLeft',
              tooltipId: 'clear-debug-tooltip',
            }}
          >
            <IconButton
              aria-label={clearLabel}
              variant="outlined"
              color="tertiary"
              size="extraSmall"
              disabled={isEmpty}
              onClick={isConsole ? clearLogs : clearRequests}
            >
              <FontAwesomeV6Icon iconName="eraser" />
            </IconButton>
          </WithTooltip>
          <CloseButton
            onClick={() => setIsOpen(false)}
            aria-label="Close debug panel"
          />
        </span>
      }
    >
      <div className={styles.body}>
        {isConsole ? <Console /> : <NetworkPanel />}
      </div>
    </PanelContainer>
  );
};
