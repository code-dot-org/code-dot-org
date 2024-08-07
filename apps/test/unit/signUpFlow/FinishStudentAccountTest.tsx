import {render} from '@testing-library/react';
import React from 'react';

// import locale from '@cdo/apps/signup/locale';
import FinishStudentAccount from '@cdo/apps/signUpFlow/FinishStudentAccount';
import {USER_NAME_SESSION_KEY} from '@cdo/apps/signUpFlow/signUpFlowConstants';

describe('FinishStudentAccount', () => {
  afterEach(() => {
    sessionStorage.removeItem(USER_NAME_SESSION_KEY);
  });

  function renderDefault() {
    render(<FinishStudentAccount />);
  }

  it('renders finish student account page', () => {
    renderDefault();
  });
});
