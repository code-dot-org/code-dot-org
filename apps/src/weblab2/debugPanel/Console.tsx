import Alert from '@code-dot-org/component-library/alert';
import type {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useRef} from 'react';

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
              icon={LEVEL_ICONS[log.level]}
              text={
                <span aria-hidden="true">{formatLogWithTimestamp(log)}</span>
              }
              size={'s'}
              aria-label={`${log.level}: ${log.message}, ${log.timestamp}`}
              className={moduleStyles.consoleLog}
              tabIndex={0}
            />
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export default Console;
