import Alert from '@code-dot-org/component-library/alert';
import {Typography} from '@mui/material';
import React, {useEffect, useRef} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  ConsoleEntry,
  ConsoleLogLevel,
} from '@cdo/apps/weblab2/redux/consoleRedux';

import EmptyPanelPlaceholder from './EmptyPanelPlaceholder';

import moduleStyles from './console.module.scss';

const Console: React.FunctionComponent = () => {
  const consoleLogs = useAppSelector(state => state.weblab2Console.logs);
  const mapLogLevelToAlertType = (level: ConsoleLogLevel) => {
    switch (level) {
      case 'log':
        return 'gray';
      case 'warn':
        return 'warning';
      case 'error':
        return 'danger';
      case 'info':
        return 'info';
    }
  };

  const formatLogWithTimestamp = (log: ConsoleEntry) => {
    return (
      <div className={moduleStyles.consoleLogEntry}>
        <Typography variant="body3" gutterBottom>
          {log.message}
        </Typography>
        <Typography
          className={moduleStyles.timestamp}
          variant="body4"
          gutterBottom
        >
          {log.timestamp}
        </Typography>
      </div>
    );
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, 50);
    return () => clearTimeout(timeout);
  }, [consoleLogs]);

  return (
    <div className={moduleStyles.consoleContainer}>
      {consoleLogs.length === 0 ? (
        <EmptyPanelPlaceholder
          iconName="terminal"
          title="No console output"
          description="Add console.log() statements to your code to see output here."
        />
      ) : (
        <>
          {consoleLogs.map((log, index) => (
            <Alert
              key={index}
              type={mapLogLevelToAlertType(log.level)}
              text={formatLogWithTimestamp(log)}
              size={'s'}
              className={moduleStyles.consoleLog}
            />
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export default Console;
