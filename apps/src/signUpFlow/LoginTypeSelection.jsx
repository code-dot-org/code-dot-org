import React, {useState} from 'react';
import i18n from '@cdo/signup/locale';
import {Heading2, Heading3} from '@cdo/apps/componentLibrary/typography';

function LoginTypeSelection() {
  return (
    <div id="signup">
      <Heading2>{i18n.sign_up_with()}</Heading2>
    </div>
  );
}

export default LoginTypeSelection;
