import classNames from 'classnames';
import React, {useMemo} from 'react';

import moduleStyles from './styles/validation-status-icon.module.scss';

interface ValidationIconProps {
  status: 'passed' | 'failed' | 'pending' | 'caution' | 'error';
  className?: string;
}

const ValidationStatusIcon: React.FunctionComponent<ValidationIconProps> = ({
  status,
  className,
}) => {
  const classes = useMemo(() => {
    const isDuotone = status !== 'pending';
    const names = isDuotone
      ? classNames(moduleStyles.duotone, 'fa-duotone fa-solid')
      : 'fa-regular';
    switch (status) {
      case 'passed':
        return classNames(names, 'fa-check-circle', moduleStyles.green);
      case 'failed':
        return classNames(names, 'fa-times-circle', moduleStyles.red);
      case 'pending':
        return classNames(names, 'fa-circle', moduleStyles.green);
      case 'caution':
        return classNames(names, 'fa-times-circle', moduleStyles.yellow);
      case 'error':
        return classNames(names, 'fa-exclamation-circle', moduleStyles.red);
    }
  }, [status]);

  return <i className={classNames(classes, className)} />;
};

export default ValidationStatusIcon;
