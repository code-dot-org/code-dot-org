import Alert from '@code-dot-org/component-library/alert';
import type {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  ConsoleEntry,
  ConsoleLogLevel,
} from '@cdo/apps/weblab2/redux/consoleRedux';

import EmptyPanelPlaceholder from './EmptyPanelPlaceholder';

import moduleStyles from './console.module.scss';

// Icons are aria-hidden so VoiceOver reads the aria-label on the Alert instead
// of announcing child elements.
// TODO: Remove once Alert is updated to support aria-hidden icons.
const LEVEL_ICONS: Partial<Record<ConsoleLogLevel, FontAwesomeV6IconProps>> = {
  warn: {iconName: 'exclamation-circle', 'aria-hidden': true},
  error: {iconName: 'circle-xmark', 'aria-hidden': true},
  info: {iconName: 'circle-info', 'aria-hidden': true},
};

const Console: React.FunctionComponent = () => {
  const consoleLogs = useAppSelector(state => state.weblab2Console.logs);
  const [isInConsoleNavigationMode, setIsInConsoleNavigationMode] =
    useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const firstLogRef = useRef<HTMLDivElement>(null);
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
        <BodyThreeText>{log.message}</BodyThreeText>
        <BodyFourText className={moduleStyles.timestamp}>
          {log.timestamp}
        </BodyFourText>
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
          {consoleLogs.map((log, index) => {
            const isFirstLog = index === 0;
            const isLastLog = index === consoleLogs.length - 1;
            const logLabel = `${log.level}: ${log.message}, ${log.timestamp}`;
            const positionLabel =
              isFirstLog && isLastLog
                ? 'Only log entry. '
                : isFirstLog
                ? 'Least recent log entry. '
                : isLastLog
                ? 'Most recent log entry. '
                : '';
            const wrapperAriaLabel = `${positionLabel}${logLabel}`;
            return (
              <div
                key={index}
                ref={el => {
                  if (isFirstLog) {
                    (
                      firstLogRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = el;
                  }
                  if (isLastLog) {
                    (
                      lastLogRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = el;
                  }
                }}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={isInConsoleNavigationMode ? 0 : -1}
                aria-label={
                  isInConsoleNavigationMode ? wrapperAriaLabel : undefined
                }
                onKeyDown={e => {
                  if (e.key === 'Escape' && e.target === e.currentTarget) {
                    setIsInConsoleNavigationMode(false);
                    parentRef.current?.focus();
                  }
                  if (!isInConsoleNavigationMode || e.key !== 'Tab') {
                    return;
                  }
                  if (isLastLog && !e.shiftKey) {
                    e.preventDefault();
                    firstLogRef.current?.focus();
                  } else if (isFirstLog && e.shiftKey) {
                    e.preventDefault();
                    lastLogRef.current?.focus();
                  }
                }}
              >
                <Alert
                  type={mapLogLevelToAlertType(log.level)}
                  icon={LEVEL_ICONS[log.level]}
                  text={
                    <span aria-hidden="true">
                      {formatLogWithTimestamp(log)}
                    </span>
                  }
                  size={'s'}
                  aria-label={
                    isInConsoleNavigationMode
                      ? undefined
                      : `${log.level}: ${log.message}, ${log.timestamp}`
                  }
                  aria-hidden={isInConsoleNavigationMode}
                  className={moduleStyles.consoleLog}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export default Console;
