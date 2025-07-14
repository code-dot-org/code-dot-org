import React from 'react';

import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';

const spinnerIcon: FontAwesomeV6IconProps = {
  iconName: 'spinner',
  iconStyle: 'solid',
  animationType: 'spin',
};

const Spinner: React.FunctionComponent = () => (
  <FontAwesomeV6Icon {...spinnerIcon} style={{fontSize: '3rem'}} />
);

export default Spinner;
