import React from 'react';

import DSCODivider, {
  DividerProps,
} from '@code-dot-org/component-library/divider';

import moduleStyles from './divider.module.scss';

const Divider: React.FC<DividerProps> = ({...props}) => {
  return <DSCODivider {...props} className={moduleStyles.divider} />;
};

export default Divider;
