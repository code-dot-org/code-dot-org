import Alert from '@code-dot-org/component-library/alert';
import {
  BodyFourText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  ConsoleEntry,
  ConsoleLogLevel,
} from '@cdo/apps/weblab2/redux/consoleRedux';

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
        <BodyThreeText>{log.message}</BodyThreeText>
        <BodyFourText className={moduleStyles.timestamp}>
          {log.timestamp}
        </BodyFourText>
      </div>
    );
  };

  return (
    <div className={moduleStyles.consoleContainer}>
      {consoleLogs.map((log, index) => (
        <Alert
          key={index}
          type={mapLogLevelToAlertType(log.level)}
          text={formatLogWithTimestamp(log)}
          size={'s'}
          className={moduleStyles.consoleLog}
        />
      ))}
    </div>
  );
};

export default Console;
