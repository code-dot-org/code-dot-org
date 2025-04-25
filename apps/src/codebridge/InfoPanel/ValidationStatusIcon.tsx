import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import moduleStyles from './styles/validation-status-icon.module.scss';

interface ValidationIconProps {
  status: 'passed' | 'failed' | 'pending' | 'caution' | 'error';
  className?: string;
}

// Component that extracts out the logic for rendering a validation status icon.
// For any but the 'pending' icon, we use a duotone icon with a white x/check/minus/exclamation mark
// and a colored circle background. For the 'pending' icon, we use a regular (unfilled) circle icon.
const ValidationStatusIcon: React.FunctionComponent<ValidationIconProps> = ({
  status,
  className,
}) => {
  const classes = useMemo(() => {
    const isDuotone = status !== 'pending';
    const names = isDuotone
      ? classNames(moduleStyles.duotone, 'fa-duotone fa-regular')
      : 'fa-regular';
    switch (status) {
      case 'passed':
        return classNames(names, 'fa-circle-check', moduleStyles.green);
      case 'failed':
        return classNames(names, 'fa-circle-xmark', moduleStyles.red);
      case 'pending':
        return classNames(names, 'fa-circle', moduleStyles.green);
      case 'caution':
        return classNames(names, 'fa-circle-minus', moduleStyles.yellow);
      case 'error':
        return classNames(names, 'fa-circle-exlamation', moduleStyles.red);
    }
  }, [status]);

  // return (
  //   <FontAwesomeV6Icon
  //     iconName={'circle-check'}
  //     iconStyle="regular"
  //     iconFamily="duotone"
  //     className={classNames(moduleStyles.duotone, moduleStyles.green)}
  //   />
  // );
  return (
    <i
      className={classNames(
        'fa-duotone fa-circle-check fa-regular',
        moduleStyles.testColors
      )}
    />
  );

  //return <i className={classNames(classes, className)} />;
};

export default ValidationStatusIcon;
