import Alert from '@code-dot-org/component-library/alert';
import {Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  ConsoleEntry,
  ConsoleLogLevel,
} from '@cdo/apps/weblab2/redux/consoleRedux';

import EmptyPanelPlaceholder from './EmptyPanelPlaceholder';

import moduleStyles from './console.module.scss';

const Console: React.FunctionComponent = () => {
  const consoleLogs = useAppSelector(state => state.weblab2Console.logs);
  const [isInConsoleNavigationMode, setIsInConsoleNavigationMode] =
    useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const lastLogRef = useRef<HTMLDivElement>(null);

  const handleParentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.target === e.currentTarget &&
      e.key === 'Enter' &&
      consoleLogs.length > 0
    ) {
      setIsInConsoleNavigationMode(true);
      lastLogRef.current?.focus();
    }
  };

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
        <Typography
          variant="body3"
          gutterBottom
          className={moduleStyles.consoleLogMessage}
        >
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
    <div
      ref={parentRef}
      className={moduleStyles.consoleContainer}
      tabIndex={consoleLogs.length > 0 ? 0 : -1}
      aria-label={
        isInConsoleNavigationMode
          ? ''
          : 'Console output: press Enter to navigate logs, Escape to exit'
      }
      onKeyDown={handleParentKeyDown}
    >
      {consoleLogs.length === 0 ? (
        <EmptyPanelPlaceholder
          iconName="terminal"
          title="No console output"
          description="Add console.log() statements to your code to see output here."
        />
      ) : (
        <>
          {consoleLogs.map((log, index) => (
            <div
              key={index}
              ref={index === consoleLogs.length - 1 ? lastLogRef : undefined}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={isInConsoleNavigationMode ? 0 : -1}
              onKeyDown={e => {
                if (e.key === 'Escape' && e.target === e.currentTarget) {
                  setIsInConsoleNavigationMode(false);
                  parentRef.current?.focus();
                }
              }}
            >
              <Alert
                type={mapLogLevelToAlertType(log.level)}
                text={formatLogWithTimestamp(log)}
                size={'s'}
                className={moduleStyles.consoleLog}
              />
            </div>
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export default Console;
