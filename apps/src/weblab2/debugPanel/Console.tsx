import Alert from '@code-dot-org/component-library/alert';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {ConsoleLogLevel} from '@cdo/apps/weblab2/redux/consoleRedux';

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

  return (
    <div className={moduleStyles.consoleContainer}>
      {consoleLogs.map((log, index) => (
        <Alert
          key={index}
          type={mapLogLevelToAlertType(log.level)}
          text={log.message}
          size={'s'}
        />
      ))}
    </div>
  );
};

export default Console;
