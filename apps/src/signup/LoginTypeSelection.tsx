import React from 'react';

import {Heading2} from '@cdo/apps/componentLibrary/typography';
import locale from '@cdo/apps/signup/locale';

const LoginTypeSelection: React.FunctionComponent = () => {
  return (
    <div id="signup">
      <Heading2>{locale.sign_up_with()}</Heading2>
    </div>
  );
};

export default LoginTypeSelection;
