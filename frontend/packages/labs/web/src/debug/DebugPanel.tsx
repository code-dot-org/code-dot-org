import {Button, IconButton, Typography} from '@mui/material';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {PanelContainer} from '@code-dot-org/lab';

import {useDebug} from './DebugContext';
import styles from './debugPanel.module.css';

// The debug panel: what the student's page logged, and what it requested over
// the network. Ported from apps/src/weblab2/debugPanel/ — the console/network
// split, the repeat-count grouping, and the blocked/CSP reporting. Legacy's
// per-request details box, response bodies, copy button, and status icons are
// deferred; the data for them already arrives.

type SelectedPanel = 'console' | 'network';

const LEVEL_CLASS: Record<string, string | undefined> = {
  error: styles.error,
  warn: styles.warn,
  info: styles.info,
};

const ConsoleView = () => {
  const {logs} = useDebug();

  if (logs.length === 0) {
    return (
      <div className={styles.empty}>
        <Typography variant="body3">
          Nothing logged yet. `console.log` from your page shows up here.
        </Typography>
      </div>
    );
  }

  return (
    <div>
      {logs.map(log => (
        <div key={log.groupKey} className={styles.entry}>
          <span className={`${styles.message} ${LEVEL_CLASS[log.level] ?? ''}`}>
            {log.message}
          </span>
          {log.count > 1 && (
            <span
              className={styles.count}
              aria-label={`repeated ${log.count} times`}
            >
              {log.count}
            </span>
          )}
          <span className={styles.timestamp}>{log.timestamp}</span>
        </div>
      ))}
    </div>
  );
};

const NetworkView = () => {
  const {requests} = useDebug();

  if (requests.length === 0) {
    return (
      <div className={styles.empty}>
        <Typography variant="body3">
          No network requests yet. Requests your page makes outside the project
          show up here.
        </Typography>
      </div>
    );
  }

  return (
    <div>
      {requests.map(({id, request, response}) => (
        <div key={id} className={styles.request}>
          <span className={styles.method}>{request.method ?? 'GET'}</span>
          <span className={styles.url} title={request.url}>
            {request.url}
          </span>
          {request.blocked ? (
            <span className={styles.blocked}>blocked</span>
          ) : request.cspDirectiveViolated ? (
            <span
              className={styles.blocked}
              title={`Blocked by content-security policy: ${request.cspDirectiveViolated}`}
            >
              CSP
            </span>
          ) : (
            <span className={styles.status}>
              {response?.status ?? '…'}
              {response?.timeElapsed !== undefined
                ? ` · ${response.timeElapsed}ms`
                : ''}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export interface DebugPanelProps {
  className?: string;
}

export const DebugPanel = ({className}: DebugPanelProps) => {
  const [selectedPanel, setSelectedPanel] = useState<SelectedPanel>('console');
  const {logs, requests, clear} = useDebug();
  const isEmpty = logs.length === 0 && requests.length === 0;

  const tab = (panel: SelectedPanel, label: string) => (
    <Button
      variant={selectedPanel === panel ? 'contained' : 'text'}
      color={selectedPanel === panel ? 'primary' : 'tertiary'}
      size="extraSmall"
      onClick={() => setSelectedPanel(panel)}
      aria-pressed={selectedPanel === panel}
    >
      {label}
    </Button>
  );

  return (
    <PanelContainer
      id="debug-panel-container"
      className={className}
      headerContent="Debug"
      leftHeaderContent={
        <span className={styles.tabs}>
          {tab('console', 'Console')}
          {tab('network', 'Network')}
        </span>
      }
      rightHeaderContent={
        <WithTooltip
          tooltipProps={{
            text: 'Clear',
            size: 'xs',
            direction: 'onLeft',
            tooltipId: 'clear-debug-tooltip',
          }}
        >
          <IconButton
            aria-label="Clear"
            variant="text"
            color="tertiary"
            size="extraSmall"
            disabled={isEmpty}
            onClick={clear}
          >
            <FontAwesomeV6Icon iconName="eraser" />
          </IconButton>
        </WithTooltip>
      }
    >
      <div className={styles.body}>
        {selectedPanel === 'network' ? <NetworkView /> : <ConsoleView />}
      </div>
    </PanelContainer>
  );
};
